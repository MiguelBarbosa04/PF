from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.chat_schema import ChatRequest, ChatResponse
from backend.core.chat_service import generate_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatRequest, db: Session = Depends(get_db)):
    try:
        resposta = await generate_chat_response(db, chat_request.user_id, chat_request.message)
        return ChatResponse(response=resposta)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
