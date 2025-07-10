from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.chat_schema import ChatRequest, ChatResponse
from backend.core.chat_service import generate_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    resposta = await generate_chat_response(db, request)
    return {"resposta": resposta}