from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.quiz import QuizCreate, RespostaUserCreate, RespostaUserRead, QuizRead
import backend.repositories.quiz as quiz_repo
from backend.repositories.global_settings import obter_modelo_mais_recente
from backend.services.rag_service import gerar_quiz_ollama, gerar_quiz_gemini
from backend.database.models import Session as SessionModel

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
async def gerar_quiz_para_sessao(payload: dict, db: Session = Depends(get_db)):
    session_id = payload.get("session_id")

    # Obter a sessão
    session = db.query(SessionModel).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    # Obter o tema da sessão
    tema = session.tema
    if not tema:
        raise HTTPException(status_code=400, detail="Sessão não tem tema ou nome de ficheiro definido.")

    # Obter modelo preferido
    modelo = obter_modelo_mais_recente(db)

    # Gerar quiz com o modelo correspondente
    if modelo == "ollama":
        quiz_data = await gerar_quiz_ollama(tema)
    elif modelo == "gemini":

        quiz_data = await gerar_quiz_gemini(tema)
    else:
        raise HTTPException(status_code=400, detail="Modelo não suportado")

    # Guardar na base de dados
    quiz = criar_quiz(QuizCreate(**quiz_data, session_id=session_id), db)
    return quiz
