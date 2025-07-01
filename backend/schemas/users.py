from pydantic import BaseModel

class UserCreate(BaseModel):
    nome: str
    email: str
    experiencia: int
    funcao: int
    ling_preferida: int
    pin: int

class UserRead(UserCreate):
    id: int

    class Config:
        orm_mode = True
