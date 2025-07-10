from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionBase(BaseModel):
    papel: str  # 'Agente' ou 'Tutor'
    tema: Optional[str] = None

class SessionCreate(SessionBase):
    user_id: int
    inicio: datetime

class SessionRead(SessionBase):
    id: int
    user_id: int
    inicio: datetime

    class Config:
        orm_mode = True