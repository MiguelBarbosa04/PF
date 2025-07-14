from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from backend.auth.hashing import get_password_hash
from backend.schemas.users import UserCreate, UserRead, UserLogin, UserUpdate
from backend.database.db import get_db
from backend.repositories.users import create_user, authenticate_user
from backend.database.models import Experiencia, Funcao, Linguagem
from backend.auth.auth import create_access_token
from backend.database.models import Users
from backend.auth.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=UserRead)
def create_user_endpoint(user: UserCreate, db: db_dependency):
    return create_user(db, user)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def read_logged_user(current_user: Users = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "funcao": current_user.funcao,
        "linguagem": current_user.ling_preferida,
        "experiencia": current_user.experiencia,
    }

@router.put("/me")
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    user = db.query(Users).filter(Users.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")

    update_data = user_update.dict(exclude_unset=True)

    if "password" in update_data:
        if update_data["password"]:
            user.password = get_password_hash(update_data["password"])
        else:
            del update_data["password"]

    for attr, value in update_data.items():
        if attr != "password":
            setattr(user, attr, value)

    db.commit()
    db.refresh(user)
    return user

@router.get("/experiencia")
def get_experiencia(db: Session = Depends(get_db)):
    return db.query(Experiencia).all()

@router.get("/funcao")
def get_funcao(db: Session = Depends(get_db)):
    return db.query(Funcao).all()

@router.get("/linguagem")
def get_linguagem(db: Session = Depends(get_db)):
    return db.query(Linguagem).all()