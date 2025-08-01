from sqlalchemy.orm import Session
from backend.database.models import Messages
from sqlalchemy import func

def get_rated_bot_messages_with_questions(db: Session, rating: int = 3):
    # Buscar todas as mensagens do bot com avaliação baixa
    low_rated_messages = (
        db.query(Messages)
        .filter(Messages.remetente == "bot", Messages.avaliacao == rating)
        .order_by(Messages.criado_em.desc())
        .all()
    )

    resultados = []
    for msg in low_rated_messages:
        # Buscar pergunta anterior na mesma sessão
        pergunta = (
            db.query(Messages)
            .filter(
                Messages.session_id == msg.session_id,
                Messages.id < msg.id,
                Messages.remetente == "user"
            )
            .order_by(Messages.id.desc())
            .first()
        )
        resultados.append({
            "resposta": msg,
            "pergunta": pergunta
        })

    return resultados

def get_rated_models(db: Session, rating: int = 2, limite: int = 10):
    resultados = (
        db.query(
            Messages.modelo,
            func.count(Messages.id).label("total_baixas")
        )
        .filter(Messages.remetente == "bot", Messages.avaliacao == rating)
        .group_by(Messages.modelo)
        .order_by(func.count(Messages.id).desc())
        .limit(limite)
        .all()
    )
    return resultados

def get_good_rated_messages(db: Session, rating: int = 5):
    mensagens_bom_feedback = (
        db.query(Messages)
        .filter(Messages.remetente == "bot", Messages.avaliacao == rating)
        .order_by(Messages.criado_em.desc())
        .all()
    )

    resultados = []
    for msg in mensagens_bom_feedback:
        pergunta = (
            db.query(Messages)
            .filter(
                Messages.session_id == msg.session_id,
                Messages.id < msg.id,
                Messages.remetente == "user"
            )
            .order_by(Messages.id.desc())
            .first()
        )
        if pergunta:  # só adiciona se tiver pergunta
            resultados.append({
                "resposta": msg,
                "pergunta": pergunta
            })

    return resultados