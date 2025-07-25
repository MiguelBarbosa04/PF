from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.quiz import QuizCreate, RespostaUserCreate, RespostaUserRead, QuizRead
import backend.repositories.quiz as quiz_repo

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/", response_model=QuizRead)
def criar_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    return quiz_repo.criar_quiz(db, quiz_data)

@router.post("/responder", response_model=RespostaUserCreate)
def responder_pergunta(resposta: RespostaUserCreate, db: Session = Depends(get_db)):
    return quiz_repo.registar_resposta(db, resposta)

@router.get("/historico/{user_id}", response_model=list[QuizRead])
def ver_historico_quizzes(user_id: int, db: Session = Depends(get_db)):
    return quiz_repo.listar_quizzes_por_user(db, user_id)

@router.get("/respostas/{user_id}", response_model=list[RespostaUserRead])
def ver_respostas(user_id: int, db: Session = Depends(get_db)):
    return quiz_repo.listar_respostas_do_user(db, user_id)
