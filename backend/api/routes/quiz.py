from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.quiz import QuizCreate, RespostaUserCreate, RespostaUserRead, QuizRead, QuizGenerationRequest, RespostaEnvio
import backend.repositories.quiz as quiz_repo
from backend.repositories.global_settings import obter_modelo_mais_recente
from backend.services.rag_service import gerar_quiz_ollama, gerar_quiz_gemini, gerar_quiz_com_rag
from backend.database.models import Session as SessionModel, Quiz, RespostaUser, Pergunta
from sqlalchemy import desc
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

    modelo = obter_modelo_mais_recente(db)  # retorna "gemini" ou "mistral"

    quiz_data = await gerar_quiz_com_rag(tema, modelo=modelo)

    quiz = quiz_repo.criar_quiz(db, QuizCreate(**quiz_data, session_id=session_id))
    return quiz

@router.get("/session/{session_id}", response_model=QuizRead)
def get_quiz_by_session(session_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.session_id == session_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz

@router.get("/session/quiz/{session_id}", response_model=QuizRead)
def get_latest_quiz_by_session(session_id: int, db: Session = Depends(get_db)):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.session_id == session_id)
        .order_by(desc(Quiz.data))  # ordena do mais recente para o mais antigo
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz


@router.post("/{quiz_id}/respostas/corrigir")
def corrigir_respostas(quiz_id: int, payload: RespostaEnvio, db: Session = Depends(get_db)):
    total = 0
    corretas = 0
    resultados = []

    for pergunta_id, opcao_escolhida_id in payload.respostas.items():
        pergunta = db.query(Pergunta).filter_by(id=pergunta_id, quiz_id=quiz_id).first()
        if not pergunta:
            raise HTTPException(status_code=404, detail=f"Pergunta {pergunta_id} não encontrada.")

        opcao_correta = next((opcao for opcao in pergunta.opcoes if opcao.correta), None)
        if not opcao_correta:
            raise HTTPException(status_code=400, detail=f"Pergunta {pergunta_id} não tem opção correta definida.")

        correta = opcao_escolhida_id == opcao_correta.id
        total += 1
        if correta:
            corretas += 1

        # Guardar resposta no histórico (opcional)
        resposta_user = RespostaUser(
            user_id=payload.user_id,
            pergunta_id=pergunta_id,
            opcao_id=opcao_escolhida_id,
            correta=correta,
            respondido_em = payload.respondido_em
        )
        db.add(resposta_user)
        resultados.append({
            "pergunta_id": pergunta_id,
            "resposta_correta": opcao_correta.id,
            "resposta_user": opcao_escolhida_id,
            "correta": correta
        })

    db.commit()

    return {
        "pontuacao": f"{corretas} / {total}",
        "acertos": corretas,
        "total": total,
        "resultados": resultados
    }

