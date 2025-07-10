from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    session_id: int
    conteudo: str
    tipo: str
    remetente: str
    criado_em: datetime
    avaliacao: Optional[int] = None

class ChatResponse(BaseModel):
    response: str


