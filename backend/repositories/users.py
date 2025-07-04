from sqlalchemy.orm import Session
from backend.database.models import Users
from backend.schemas.users import UserCreate
from fastapi import HTTPException
from backend.auth.hashing import get_password_hash

def create_user(db: Session, user: UserCreate):
    db_user = Users(
        nome=user.nome,
        email=user.email,
        experiencia=user.experiencia,
        funcao=user.funcao,
        ling_preferida=user.ling_preferida,
        password=get_password_hash(user.password),
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {e}")
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    return db.query(Users).filter(Users.email == email, Users.password == password).first()