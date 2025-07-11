from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    session_id: Optional[int] = None
    conteudo: str
    tipo: str
    remetente: str
    criado_em: datetime
    avaliacao: Optional[int] = None

class MessageRead(ChatRequest):
    id: int
    session_id: int
    criado_em: datetime
    avaliacao: Optional[int]

    class Config:
        orm_mode = True

class MessageUpdateRating(BaseModel):
    avaliacao: int

class ChatResponse(BaseModel):
    response: str