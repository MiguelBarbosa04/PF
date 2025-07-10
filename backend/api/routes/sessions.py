from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.db import get_db
from backend.schemas.sessions import SessionCreate, SessionRead
from backend.repositories.sessions import create_session, get_session, get_sessions_by_user

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("/", response_model=SessionRead)
def create_new_session(session: SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, session)

@router.get("/{session_id}", response_model=SessionRead)
def read_session(session_id: int, db: Session = Depends(get_db)):
    db_session = get_session(db, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return db_session

@router.get("/user/{user_id}", response_model=List[SessionRead])
def read_sessions_by_user(user_id: int, db: Session = Depends(get_db)):
    return get_sessions_by_user(db, user_id)