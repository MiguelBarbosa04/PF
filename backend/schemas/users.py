from typing import Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    nome: str
    email: str
    experiencia: int
    funcao: int
    ling_preferida: int
    password: str

class UserRead(UserCreate):
    id: int

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    nome: str
    email: str
    experiencia: int
    funcao: int
    ling_preferida: int
    password: Optional[str] = None