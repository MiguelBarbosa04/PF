from pydantic import BaseModel
from backend.schemas.messages_schema import MessageRead
from typing import Optional

class FeedbackMessage(BaseModel):
    pergunta: Optional[MessageRead]
    resposta: MessageRead

class QAExport(BaseModel):
    pergunta: str
    resposta: str