from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.schemas.quiz_schema import QuizCreate, RespostaUserCreate, RespostaUserRead, QuizRead, \
    QuizGenerationRequest, RespostaEnvio, QuizHistoricoRead
from backend.repositories.quiz_repository import obter_respostas_quiz
import backend.repositories.quiz_repository as quiz_repo
from backend.repositories.global_settings_repository import obter_modelo_mais_recente
from backend.services.rag_service import gerar_quiz_ollama, gerar_quiz_gemini, gerar_quiz_com_rag
from backend.database.models import Session as SessionModel, Quiz, RespostaUser, Pergunta, Opcao
from sqlalchemy import desc
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/", response_model=QuizRead)
def criar_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    return quiz_repo.criar_quiz(db, quiz_data)

@router.post("/responder", response_model=RespostaUserCreate)
def responder_pergunta(resposta: RespostaUserCreate, db: Session = Depends(get_db)):
    return quiz_repo.registar_resposta(db, resposta)

# @router.get("/historico/{user_id}", response_model=list[QuizRead])
# def ver_historico_quizzes(user_id: int, db: Session = Depends(get_db)):
#     return quiz_repo.listar_quizzes_por_user(db, user_id)

@router.get("/historico/{user_id}", response_model=list[QuizHistoricoRead])
def ver_historico_quizzes(user_id: int, db: Session = Depends(get_db)):
    return quiz_repo.listar_quizzes_por_user_historico(db, user_id)


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

@router.get("/respostas/{quiz_id}/{user_id}")
def get_respostas_quiz(quiz_id: int, user_id: int, db: Session = Depends(get_db)):
    respostas = obter_respostas_quiz(db, quiz_id, user_id)
    if respostas is None:
        raise HTTPException(status_code=404, detail="Respostas não encontradas")
    return respostas

@router.get("/quizzes/respostas/{quiz_id}/{user_id}")
def get_respostas_do_user_por_quiz(quiz_id: int, user_id: int, db: Session = Depends(get_db)):
    perguntas = (
        db.query(Pergunta)
        .options(joinedload(Pergunta.opcoes))
        .filter(Pergunta.quiz_id == quiz_id)
        .all()
    )

    resultado = []

    for i, pergunta in enumerate(perguntas, start=1):  # Começa em 1
        resposta = (
            db.query(RespostaUser)
            .filter(RespostaUser.pergunta_id == pergunta.id, RespostaUser.user_id == user_id)
            .first()
        )

        opcao_respondida_id = resposta.opcao_id if resposta else None

        resultado.append({
            "numero": i,  # Adiciona o número da pergunta
            "pergunta": pergunta.enunciado,
            "opcoes": [
                {
                    "id": op.id,
                    "texto": op.texto,
                    "correta": op.correta,
                    "foi_escolhida": op.id == opcao_respondida_id
                } for op in pergunta.opcoes
            ]
        })

    return resultado

@router.get("/{quiz_id}", response_model=QuizRead)
def get_quiz_by_id(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz

@router.post("/quizzes/{quiz_id}/duplicar")
def duplicar_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz_original = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz_original:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")

    novo_quiz = Quiz(
        titulo=quiz_original.titulo + " (Repetição)",
        descricao=quiz_original.descricao,
        session_id=quiz_original.session_id,
        data=datetime.utcnow()
    )
    db.add(novo_quiz)
    db.flush()

    for pergunta in quiz_original.perguntas:
        nova_pergunta = Pergunta(enunciado=pergunta.enunciado, quiz_id=novo_quiz.id)
        db.add(nova_pergunta)
        db.flush()
        for opcao in pergunta.opcoes:
            nova_opcao = Opcao(
                texto=opcao.texto,
                correta=opcao.correta,
                pergunta_id=nova_pergunta.id
            )
            db.add(nova_opcao)

    db.commit()
    db.refresh(novo_quiz)
    return novo_quiz

