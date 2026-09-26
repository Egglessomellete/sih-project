"""
Pydantic schemas for Auth and User management.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.enums import ROLE_DENSITY, Role, UIDensity


class CitizenSignup(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: Role = Field(default=Role.CITIZEN)


class SolverSignup(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: Role = Field(...)  # university, industry, govt, or pri/ulb
    organization: str = Field(..., min_length=2, max_length=255)
    designation: Optional[str] = Field(None, max_length=255)
    expertise_tags: Optional[str] = Field(None, description="Comma-separated expertise domains")
    district: Optional[str] = Field(None, max_length=100)


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    ui_density: UIDensity
    user_id: int
    full_name: str
    first_login: bool


class UserResponse(BaseModel):
    id: int
    phone: str
    email: Optional[str] = None
    full_name: str
    role: Role
    ui_density: UIDensity
    organization: Optional[str] = None
    designation: Optional[str] = None
    expertise_tags: Optional[str] = None
    district: Optional[str] = None
    first_login: bool

    class Config:
        from_attributes = True

    @classmethod
    def from_user(cls, user):
        """Construct response with derived ui_density."""
        return cls(
            id=user.id,
            phone=user.phone or "",
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            ui_density=ROLE_DENSITY.get(user.role, UIDensity.SIMPLE),
            organization=user.organization,
            designation=user.designation,
            expertise_tags=user.expertise_tags,
            district=user.district,
            first_login=user.first_login,
        )
