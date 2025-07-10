from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    conteudo: str
    tipo: str  # 'texto' ou 'voz'
    remetente: str  # 'user' ou 'bot'

class MessageCreate(MessageBase):
    session_id: int
    criado_em: datetime
    avaliacao: Optional[int] = None

class MessageRead(MessageBase):
    id: int
    session_id: int
    criado_em: datetime
    avaliacao: Optional[int]

    class Config:
        orm_mode = True

class MessageUpdateRating(BaseModel):
    avaliacao: int