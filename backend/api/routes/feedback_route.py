from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.repositories import feedback_repository
from backend.schemas.feedback_schema import FeedbackMessage

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.get("/avaliacoes", response_model=list[FeedbackMessage])
def listar_respostas_com_avaliacao_especifica(
    rating: int = Query(3, ge=1, le=5),
    db: Session = Depends(get_db)
):
    return feedback.get_rated_bot_messages_with_questions(db, rating=rating)

@router.get("/avaliacoes-por-modelo")
def modelos_com_avaliacao_especifica(
    rating: int = Query(2, ge=1, le=5),
    limite: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    resultados = feedback.get_rated_models(db, rating=rating, limite=limite)
    return [{"modelo": r.modelo, "total": r.total_baixas} for r in resultados]