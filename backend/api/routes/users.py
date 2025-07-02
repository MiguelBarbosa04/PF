from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from backend.schemas.users import UserCreate, UserRead, UserLogin
from backend.database.db import get_db
from backend.repositories.users import create_user, authenticate_user

router = APIRouter(prefix="/users", tags=["Users"])

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=UserRead)
def create_user_endpoint(user: UserCreate, db: db_dependency):
    return create_user(db, user)

@router.post("/login", response_model=UserRead)
def login_user(user: UserLogin, db: db_dependency):
    db_user = authenticate_user(db, user.email, user.pin)
    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return db_user