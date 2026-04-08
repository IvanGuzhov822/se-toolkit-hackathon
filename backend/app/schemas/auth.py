from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4, max_length=100)
    sleep_start: str = Field("23:00", pattern=r"^\d{2}:\d{2}$")
    sleep_end: str = Field("07:00", pattern=r"^\d{2}:\d{2}$")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    sleep_start: str
    sleep_end: str


class UserResponse(BaseModel):
    id: str
    username: str
    sleep_start: str
    sleep_end: str
