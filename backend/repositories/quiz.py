from sqlalchemy.orm import Session
from backend.database.models import Quiz, Pergunta, Opcao, RespostaUser
from backend.schemas.quiz import QuizCreate, RespostaUserCreate

def criar_quiz(db: Session, quiz_data: QuizCreate):
    quiz = Quiz(titulo=quiz_data.titulo, descricao=quiz_data.descricao, session_id=quiz_data.session_id)
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
    resposta_db = RespostaUser(
        user_id=resposta.user_id,
        pergunta_id=resposta.pergunta_id,
        opcao_id=resposta.opcao_id,
        correta=resposta.correta
    )
    db.add(resposta_db)
    db.commit()
    db.refresh(resposta_db)
    return resposta_db

def listar_quizzes_por_user(db: Session, user_id: int):
    return (
        db.query(Quiz)
        .join(Pergunta)
        .join(RespostaUser)
        .filter(RespostaUser.user_id == user_id)
        .distinct()
        .all()
    )

def listar_respostas_do_user(db: Session, user_id: int):
    return (
        db.query(RespostaUser)
        .filter(RespostaUser.user_id == user_id)
        .all()
    )
