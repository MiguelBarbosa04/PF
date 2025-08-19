from sqlalchemy.orm import Session
from backend.database.models import Messages
from backend.repositories.chroma_repository import indexar_qa_pergunta_resposta
from backend.database.models import Session as Sessions

def get_messages_by_session(db: Session, session_id: int):
    return db.query(Messages).filter(Messages.session_id == session_id).order_by(Messages.id).all()

def update_message_rating(db: Session, message_id: int, rating: int):
    db_message = db.query(Messages).filter(Messages.id == message_id).first()
    if db_message:
        db_message.avaliacao = rating
        db.commit()
        db.refresh(db_message)

        # Se for avaliação 5, indexa pergunta–resposta no Chroma
        if db_message.remetente == "bot" and rating == 5:
            pergunta = (
                db.query(Messages)
                .filter(
                    Messages.session_id == db_message.session_id,
                    Messages.id < db_message.id,
                    Messages.remetente == "user"
                )
                .order_by(Messages.id.desc())
                .first()
            )

            sessao = db.query(Sessions).filter(Sessions.id == db_message.session_id).first()
            filename = sessao.tema if sessao else None

            if pergunta:
                indexar_qa_pergunta_resposta(
                    pergunta=pergunta.conteudo,
                    resposta=db_message.conteudo,
                    modelo=db_message.modelo,  # se usas esse campo
                    filename=filename
                )

    return db_message

def delete_message(db: Session, message_id: int):
    db_message = db.query(Messages).filter(Messages.id == message_id).first()
    if db_message:
        db.delete(db_message)
        db.commit()
    return db_message