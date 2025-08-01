from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database.models import Quiz
from backend.repositories import statistics_repository
from backend.schemas.statistics_schema import QuizStatistics

router = APIRouter(prefix="/estatisticas", tags=["Estatísticas"])

@router.get("/{user_id}", response_model=QuizStatistics)
def obter_estatisticas(user_id: int, db: Session = Depends(get_db)):
    return statistics_repository.calcular_estatisticas_usuario(db, user_id)

