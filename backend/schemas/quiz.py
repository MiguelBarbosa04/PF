from datetime import datetime
from typing import List, Optional
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
class PerguntaBase(BaseModel):
    enunciado: str


class PerguntaCreate(PerguntaBase):
    opcoes: List[OpcaoCreate]


class PerguntaRead(PerguntaBase):
    id: int
    opcoes: List[OpcaoRead]

    class Config:
        orm_mode = True


# === Quiz ===
class QuizBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None


class QuizCreate(QuizBase):
    session_id: int
    perguntas: List[PerguntaCreate]
    data: datetime


class QuizRead(QuizBase):
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