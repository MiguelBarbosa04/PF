from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.auth.auth import get_current_user
from backend.schemas.users import UserRead
from backend.services.chat_service import generate_chat_response
from backend.database.db import get_db
from backend.schemas.messages import ChatRequest
from backend.schemas.messages import MessageRead, MessageUpdateRating
from backend.repositories.messages import get_messages_by_session
from backend.repositories import messages as repo
from backend.schemas.messages import ChatFullResponse

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=ChatFullResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: UserRead=Depends(get_current_user),):
    message, session_id = await generate_chat_response(db, request, user_id=current_user.id, papel=request.papel)
    return {"resposta": message.conteudo, "session_id": session_id, "id": message.id}

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