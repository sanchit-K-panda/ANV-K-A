"""Security helpers — password hashing (Argon2), JWT token handling, and session credentials."""
from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# CryptContext configured with argon2 (with bcrypt fallback)
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return bool(pwd_context.verify(plain_password, hashed_password))


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2."""
    return str(pwd_context.hash(password))


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


def generate_session_credential(
    user_id: uuid.UUID | str,
    device_id: uuid.UUID | str,
    session_id: uuid.UUID | str,
    role: str,
    timestamp: datetime,
    permissions: dict[str, Any] | str,
) -> str:
    """Generate a cryptographic session credential.
    
    Format: User+Device+Session+Role+Timestamp+Permissions signed with SECRET_KEY.
    """
    perm_str = permissions if isinstance(permissions, str) else json.dumps(permissions, sort_keys=True)
    ts_str = timestamp.isoformat()
    raw = f"{user_id}:{device_id}:{session_id}:{role}:{ts_str}:{perm_str}"
    
    sig = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        raw.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    
    # Return compact session credential
    return f"{sig}:{ts_str}"
