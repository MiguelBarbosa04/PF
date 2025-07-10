from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.db import get_db
from backend.schemas.messages import MessageCreate, MessageRead, MessageUpdateRating
from backend.repositories.messages import create_message, get_messages_by_session
from backend.repositories import messages as repo

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=MessageRead)
def create_new_message(message: MessageCreate, db: Session = Depends(get_db)):
    return create_message(db, message)

@router.get("/session/{session_id}", response_model=List[MessageRead])
def read_messages_by_session(session_id: int, db: Session = Depends(get_db)):
    return get_messages_by_session(db, session_id)

@router.put("/{message_id}/rating")
def update_rating(message_id: int, rating_data: MessageUpdateRating, db: Session = Depends(get_db)):
    updated = repo.update_message_rating(db, message_id, rating_data.avaliacao)
    if not updated:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    return updated

@router.delete("/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db)):
    deleted = repo.delete_message(db, message_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    return {"detail": "Mensagem apagada com sucesso"}