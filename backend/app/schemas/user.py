from pydantic import BaseModel, EmailStr, field_validator
import re


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password) or not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("Password must have at least 8 characters, including uppercase, lowercase, a number, and a special character.")
        return password


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
