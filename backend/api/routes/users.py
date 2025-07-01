from backend.database.db import get_db
from backend.database.models import Users as UsersModel
from backend.schemas.users import UserCreate, UserRead
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

router = APIRouter(prefix="/users", tags=["Users"])

db_dependency = Annotated[Session, Depends(get_db)]
@router.post("/", response_model=UserRead)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = UsersModel(
        id=user.id,
        nome=user.nome,
        email=user.email,
        experiencia=user.experiencia,
        funcao=user.funcao,
        ling_preferida=user.ling_preferida,
        pin=user.pin
    )
    db.add(db_user)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar utilizador: {e}")
    db.refresh(db_user)
    return db_user