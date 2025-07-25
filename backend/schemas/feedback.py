from pydantic import BaseModel
from backend.schemas.messages import MessageRead
from typing import Optional

class FeedbackMessage(BaseModel):
    pergunta: Optional[MessageRead]
    resposta: MessageRead
