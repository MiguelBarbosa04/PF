from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.quiz import QuizCreate, RespostaUserCreate, RespostaUserRead, QuizRead, QuizGenerationRequest
import backend.repositories.quiz as quiz_repo
from backend.repositories.global_settings import obter_modelo_mais_recente
from backend.services.rag_service import gerar_quiz_ollama, gerar_quiz_gemini, gerar_quiz_com_rag
from backend.database.models import Session as SessionModel, Quiz

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

@router.post("/gerar_quiz", response_model=QuizRead)
async def gerar_quiz_para_sessao(payload: QuizGenerationRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id

    session = db.query(SessionModel).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    tema = session.tema
    if not tema:
        raise HTTPException(status_code=400, detail="Sessão não tem tema definido.")

    modelo = obter_modelo_mais_recente(db)  # retorna "gemini" ou "mistral" / "ollama"

    quiz_data = await gerar_quiz_com_rag(tema, modelo=modelo)

    quiz = quiz_repo.criar_quiz(db, QuizCreate(**quiz_data, session_id=session_id))
    return quiz

@router.get("/session/{session_id}", response_model=QuizRead)
def get_quiz_by_session(session_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.session_id == session_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz