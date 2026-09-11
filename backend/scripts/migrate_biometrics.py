import asyncio
import json
import uuid
import os
import sys
from datetime import UTC, datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.models.base import AsyncSessionLocal
from app.models.identity import User, BiometricProfile, UserRole
from app.auth.security import get_password_hash

FACEREC_JSON_PATH = "/home/tejasw/SIH/FaceRec/facerec_data.json"

# Map JSON names to emails to align with our system
USER_MAPPING = {
    "Tejasw": ("supervisor@anviksa.local", "Tejasw"),
    "rio": ("admin@anviksa.local", "rio"),
    "sANCHIT": ("analyst@anviksa.local", "sANCHIT")
}

async def migrate_biometrics():
    if not os.path.exists(FACEREC_JSON_PATH):
        print(f"Error: Could not find {FACEREC_JSON_PATH}")
        return

    with open(FACEREC_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:
        for record in data:
            json_name = record.get("name")
            if json_name not in USER_MAPPING:
                print(f"Skipping unknown user in JSON: {json_name}")
                continue

            email, display_name = USER_MAPPING[json_name]
            encodings = record.get("encodings", {})
            if not encodings:
                print(f"No encodings found for {json_name}")
                continue

            # Prefer Front, otherwise grab whatever is there
            token = encodings.get("Front") or list(encodings.values())[0]

            # 1. Upsert User
            res = await session.execute(select(User).where(User.email == email))
            user = res.scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    name=display_name,
                    email=email,
                    role=UserRole.SUPERVISOR if "supervisor" in email else UserRole.ADMIN,
                    status="ACTIVE",
                    password_hash=get_password_hash("anviksa_supervisor"),
                    created_at=datetime.now(UTC),
                    updated_at=datetime.now(UTC),
                )
                session.add(user)
                await session.flush()
                print(f"Created user: {display_name} ({email})")
            else:
                user.name = display_name
                print(f"Updated user name to: {display_name} ({email})")

            # 2. Upsert Biometric Profile
            res_bp = await session.execute(
                select(BiometricProfile).where(BiometricProfile.user_id == user.id)
            )
            bp = res_bp.scalar_one_or_none()
            
            if not bp:
                bp = BiometricProfile(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    protected_template=token.encode("utf-8"),
                    encryption_key_reference="FERNET_v1",
                    created_at=datetime.now(UTC),
                    updated_at=datetime.now(UTC)
                )
                session.add(bp)
                print(f"Added biometric profile for {display_name}")
            else:
                bp.protected_template = token.encode("utf-8")
                bp.updated_at = datetime.now(UTC)
                print(f"Updated biometric profile for {display_name}")
                
        await session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate_biometrics())
