"""FastAPI security dependencies — token extraction, user authentication, role enforcement."""
from __future__ import annotations

import uuid
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import decode_access_token
from app.models.base import get_db
from app.models.identity import Session, User, UserRole

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user_and_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> tuple[User, Session]:
    """Validate Bearer token and active session."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    session_id_str = payload.get("session_id")

    if not user_id_str or not session_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claims",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(user_id_str)
        session_id = uuid.UUID(session_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid UUID format in token claims",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await db.get(User, user_id)
    if not user or user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    session = await db.get(Session, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if session.session_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Session is {session.session_status}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user, session


async def get_current_user(
    auth: tuple[User, Session] = Depends(get_current_user_and_session),
) -> User:
    """Dependency returning only the authenticated User."""
    return auth[0]


async def get_current_session(
    auth: tuple[User, Session] = Depends(get_current_user_and_session),
) -> Session:
    """Dependency returning only the active Session."""
    return auth[1]


def require_role(*roles: UserRole | str) -> Callable:
    """Dependency factory ensuring user has at least one of the specified roles."""
    allowed_roles = {r.value if isinstance(r, UserRole) else r.upper() for r in roles}

    async def _role_checker(user: User = Depends(get_current_user)) -> User:
        user_role_str = user.role.value if hasattr(user.role, "value") else user.role.split(".")[-1].upper()
        if user_role_str not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {list(allowed_roles)}, Got: {user_role_str}",
            )
        return user

    return _role_checker
