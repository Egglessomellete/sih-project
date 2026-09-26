"""
Auth endpoints — signup, login, profile retrieval, tour status update.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import ROLE_DENSITY, UIDensity
from app.models.models import User
from app.schemas.user import (
    CitizenSignup,
    LoginRequest,
    SolverSignup,
    TokenResponse,
    UserResponse,
)
from app.services.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup/citizen", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup_citizen(data: CitizenSignup, db: Session = Depends(get_db)):
    """Simple signup for citizens & community members."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=data.email,
        phone=data.phone,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        first_login=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    density = ROLE_DENSITY.get(user.role, UIDensity.SIMPLE)
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value, "density": density.value}
    )

    return TokenResponse(
        access_token=token,
        role=user.role,
        ui_density=density,
        user_id=user.id,
        full_name=user.full_name,
        first_login=user.first_login,
    )


@router.post("/signup/solver", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup_solver(data: SolverSignup, db: Session = Depends(get_db)):
    """Detailed signup for universities, industry partners, and government officials."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=data.email,
        phone=data.phone,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        organization=data.organization,
        designation=data.designation,
        expertise_tags=data.expertise_tags,
        district=data.district,
        first_login=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    density = ROLE_DENSITY.get(user.role, UIDensity.DETAILED)
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value, "density": density.value}
    )

    return TokenResponse(
        access_token=token,
        role=user.role,
        ui_density=density,
        user_id=user.id,
        full_name=user.full_name,
        first_login=user.first_login,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    density = ROLE_DENSITY.get(user.role, UIDensity.SIMPLE)
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value, "density": density.value}
    )

    return TokenResponse(
        access_token=token,
        role=user.role,
        ui_density=density,
        user_id=user.id,
        full_name=user.full_name,
        first_login=user.first_login,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current logged-in user."""
    return UserResponse.from_user(current_user)


@router.post("/complete-tour", response_model=UserResponse)
def complete_tour(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark first_login flag as False after onboarding tutorial."""
    current_user.first_login = False
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_user(current_user)
