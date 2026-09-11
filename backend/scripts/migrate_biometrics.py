"""Seed biometric users from facerec_data.json into the database."""
import asyncio
import json
import os
import sys
import uuid
from datetime import UTC, datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, text
from app.models.base import AsyncSessionLocal
from app.models.identity import BiometricProfile, User, UserRole
from app.auth.security import get_password_hash

# Path to the in-repo copy of facerec_data.json
FACEREC_JSON_PATH = os.path.join(
    os.path.dirname(__file__), "..", "app", "ml", "facerec_original", "facerec_data.json"
)

# Map JSON names → (email, display_name, role, default_password)
USER_MAPPING = {
    "Tejasw": ("supervisor@anviksa.local", "Tejasw", UserRole.SUPERVISOR, "anviksa_supervisor"),
    "rio": ("admin@anviksa.local", "rio", UserRole.ADMIN, "anviksa_admin"),
    "sANCHIT": ("analyst@anviksa.local", "sANCHIT", UserRole.ANALYST, "anviksa_analyst"),
    "HRIDAY": ("hriday@anviksa.local", "HRIDAY", UserRole.ANALYST, "anviksa_hriday"),
}


async def migrate_biometrics():
    json_path = os.path.abspath(FACEREC_JSON_PATH)
    if not os.path.exists(json_path):
        print(f"Error: Could not find {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:
        # Ensure new columns exist in database
        columns_to_add = [
            ("age", "VARCHAR(10) NULL"),
            ("height", "VARCHAR(10) NULL"),
            ("weight", "VARCHAR(10) NULL"),
            ("biometric_registered_at", "DATETIME(6) NULL"),
            ("encoding_front", "TEXT NULL"),
            ("encoding_left", "TEXT NULL"),
            ("encoding_right", "TEXT NULL"),
        ]
        for col_name, col_type in columns_to_add:
            try:
                await session.execute(
                    text(f"ALTER TABLE biometric_profiles ADD COLUMN {col_name} {col_type}")
                )
                await session.commit()
                print(f"Added column {col_name} to biometric_profiles")
            except Exception:
                await session.rollback()

        for record in data:
            json_name = record.get("name")
            if json_name not in USER_MAPPING:
                print(f"Skipping unknown user in JSON: {json_name}")
                continue

            email, display_name, role, password = USER_MAPPING[json_name]
            encodings = record.get("encodings", {})
            if not encodings:
                print(f"No encodings found for {json_name}")
                continue

            # Prefer Front for primary template, fall back to whatever is available
            primary_token = encodings.get("Front") or list(encodings.values())[0]

            # Parse registration timestamp
            reg_at_str = record.get("registered_at")
            biometric_registered_at = None
            if reg_at_str:
                try:
                    biometric_registered_at = datetime.fromisoformat(reg_at_str).replace(tzinfo=UTC)
                except Exception:
                    biometric_registered_at = datetime.now(UTC)

            # --- Upsert User ---
            res = await session.execute(select(User).where(User.email == email))
            user = res.scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    name=display_name,
                    email=email,
                    role=role.value,
                    status="ACTIVE",
                    password_hash=get_password_hash(password),
                    created_at=datetime.now(UTC),
                    updated_at=datetime.now(UTC),
                )
                session.add(user)
                await session.flush()
                print(f"Created user: {display_name} ({email}) [{role.value}]")
            else:
                user.name = display_name
                print(f"Updated user name to: {display_name} ({email})")

            # --- Upsert Biometric Profile ---
            res_bp = await session.execute(
                select(BiometricProfile).where(BiometricProfile.user_id == user.id)
            )
            bp = res_bp.scalar_one_or_none()

            profile_data = dict(
                protected_template=primary_token.encode("utf-8"),
                encryption_key_reference="FERNET_v1",
                age=record.get("age"),
                height=record.get("height"),
                weight=record.get("weight"),
                biometric_registered_at=biometric_registered_at,
                encoding_front=encodings.get("Front"),
                encoding_left=encodings.get("Left"),
                encoding_right=encodings.get("Right"),
                updated_at=datetime.now(UTC),
            )

            if not bp:
                bp = BiometricProfile(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    created_at=datetime.now(UTC),
                    **profile_data,
                )
                session.add(bp)
                print(f"  + Biometric profile for {display_name} (Front/Left/Right)")
            else:
                for k, v in profile_data.items():
                    setattr(bp, k, v)
                print(f"  ~ Updated biometric profile for {display_name}")

        await session.commit()
        print("\n✓ Migration complete! All biometric profiles seeded.")


if __name__ == "__main__":
    asyncio.run(migrate_biometrics())
