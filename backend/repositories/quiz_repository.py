from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.database.models import Quiz, Pergunta, Opcao, RespostaUser
from backend.schemas.quiz_schema import QuizCreate, RespostaUserCreate

def criar_quiz(db: Session, quiz_data: QuizCreate):
    quiz = Quiz(titulo=quiz_data.titulo, descricao=quiz_data.descricao, session_id=quiz_data.session_id, data=datetime.utcnow())
    db.add(quiz)
    db.flush()

    for pergunta_data in quiz_data.perguntas:
        pergunta = Pergunta(enunciado=pergunta_data.enunciado, quiz_id=quiz.id)
        db.add(pergunta)
        db.flush()
        for opcao_data in pergunta_data.opcoes:
            opcao = Opcao(texto=opcao_data.texto, correta=opcao_data.correta, pergunta_id=pergunta.id)
            db.add(opcao)

    db.commit()
    db.refresh(quiz)
    return quiz

def registar_resposta(db: Session, resposta: RespostaUserCreate):
    opcao = db.query(Opcao).filter_by(id=resposta.opcao_id).first()
    correta = opcao.correta if opcao else False
    resposta_db = RespostaUser(
        user_id=resposta.user_id,
        pergunta_id=resposta.pergunta_id,
        opcao_id=resposta.opcao_id,
        correta=correta,
        respondido_em=resposta.respondido_em
    )
    db.add(resposta_db)
    db.commit()
    db.refresh(resposta_db)
    return resposta_db

def listar_quizzes_por_user(db: Session, user_id: int):
    return (
        db.query(Quiz)
        .join(Pergunta, Quiz.id == Pergunta.quiz_id)
        .join(RespostaUser, Pergunta.id == RespostaUser.pergunta_id)
        .filter(RespostaUser.user_id == user_id)
        .distinct(Quiz.id)
        .all()
    )

def listar_quizzes_por_user_historico(db: Session, user_id: int):
    subquery = (
        db.query(
            Quiz.id.label("quiz_id"),
            Quiz.titulo,
            Quiz.descricao,
            Quiz.session_id,
            func.max(RespostaUser.respondido_em).label("data_resposta")
        )
        .join(Pergunta, Quiz.id == Pergunta.quiz_id)
        .join(RespostaUser, Pergunta.id == RespostaUser.pergunta_id)
        .filter(RespostaUser.user_id == user_id)
        .group_by(Quiz.id)
        .subquery()
    )

    return db.query(
        Quiz.id,
        Quiz.titulo,
        Quiz.descricao,
        Quiz.session_id,
        subquery.c.data_resposta.label("data")
    ).join(subquery, Quiz.id == subquery.c.quiz_id).all()


def listar_respostas_do_user(db: Session, user_id: int):
    return (
        db.query(RespostaUser)
        .filter(RespostaUser.user_id == user_id)
        .all()
    )

def obter_respostas_quiz(db: Session, quiz_id: int, user_id: int):
    perguntas = (
        db.query(Pergunta)
        .filter(Pergunta.quiz_id == quiz_id)
        .all()
    )

    resultado = []

    for pergunta in perguntas:
        resposta_user = (
            db.query(RespostaUser)
            .filter(RespostaUser.user_id == user_id, RespostaUser.pergunta_id == pergunta.id)
            .first()
        )

        if not resposta_user:
            continue

        opcao_user = (
            db.query(Opcao)
            .filter(Opcao.id == resposta_user.opcao_id)
            .first()
        )

        opcoes = (
            db.query(Opcao)
            .filter(Opcao.pergunta_id == pergunta.id)
            .all()
        )

        resultado.append({
            "pergunta": pergunta.enunciado,
            "resposta_user": opcao_user.texto if opcao_user else None,
            "correta": resposta_user.correta,
            "opcoes": [
                {
                    "id": o.id,
                    "texto": o.texto,
                    "correta": o.correta,
                    "foi_escolhida": o.id == resposta_user.opcao_id
                } for o in opcoes
            ]
        })

    return resultado

