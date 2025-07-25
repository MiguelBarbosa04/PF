from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.repositories import feedback
from backend.schemas.feedback import FeedbackMessage

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.get("/avaliacoes-baixas", response_model=list[FeedbackMessage])
def listar_respostas_com_avaliacao_baixa(db: Session = Depends(get_db)):
    return feedback.get_low_rated_bot_messages_with_questions(db)

@router.get("/avaliacoes-baixas-por-modelo")
def modelos_com_piores_avaliacoes(db: Session = Depends(get_db)):
    resultados = feedback.get_low_rated_models(db)
    return [{"modelo": r.modelo, "total": r.total_baixas} for r in resultados]