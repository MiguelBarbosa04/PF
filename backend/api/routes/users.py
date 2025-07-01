from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from backend.schemas.users import UserCreate, UserRead
from backend.database.db import get_db
from backend.repositories.users import create_user

router = APIRouter(prefix="/users", tags=["Users"])

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=UserRead)
def create_user_endpoint(user: UserCreate, db: db_dependency):
    return create_user(db, user)
