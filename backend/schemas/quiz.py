from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, ConfigDict


# === Opção ===
class OpcaoBase(BaseModel):
    texto: str
    correta: bool


class OpcaoCreate(OpcaoBase):
    pass


class OpcaoRead(OpcaoBase):
    id: int

    class Config:
        orm_mode = True


# === Pergunta ===
class PerguntaCreate(BaseModel):
    enunciado: str
    opcoes: list[OpcaoCreate]


class PerguntaRead(PerguntaCreate):
    id: int
    opcoes: List[OpcaoRead]

    class Config:
        orm_mode = True


# === Quiz ===
class QuizCreate(BaseModel):
    titulo: str
    descricao: str
    session_id: int
    perguntas: list[PerguntaCreate]

class QuizGenerationRequest(BaseModel):
    session_id: int


class QuizRead(QuizCreate):
    id: int
    perguntas: List[PerguntaRead]

    class Config:
        orm_mode = True


# === Resposta ===
class RespostaUserCreate(BaseModel):
    user_id: int
    pergunta_id: int
    opcao_id: int
    respondido_em: datetime


class RespostaUserRead(BaseModel):
    id: int
    pergunta_id: int
    opcao_id: Optional[int]
    correta: Optional[bool]
    respondido_em: datetime

    model_config = ConfigDict(arbitrary_types_allowed=True)

class RespostaEnvio(BaseModel):
    user_id: int
    respostas: Dict[int, int]  # { pergunta_id: opcao_id }
    respondido_em: datetime

