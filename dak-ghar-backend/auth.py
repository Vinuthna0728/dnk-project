import os

from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from database import get_db
from models import User


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Convert a plain-text password into a secure password hash.
    """
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its stored hash.
    """
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)


if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not set in .env"
    )


# ============================================================
# JWT TOKEN CREATION
# ============================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str,
) -> str:
    """
    Create a JWT access token for an authenticated user.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token


# ============================================================
# JWT TOKEN EXTRACTION
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT token and return the authenticated user.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        # Extract user ID
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Make sure user ID is valid
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise credentials_exception

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    except jwt.InvalidTokenError:
        raise credentials_exception

    # Find user in database
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user