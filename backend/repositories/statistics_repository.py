from sqlalchemy.orm import Session
from backend.database.models import RespostaUser, Pergunta, Quiz
from sqlalchemy import func

def calcular_estatisticas_usuario(db: Session, user_id: int):
    # Subquery para buscar quiz_id por cada pergunta respondida
    subquery = (
        db.query(Pergunta.id, Pergunta.quiz_id)
        .subquery()
    )

    # Junta RespostaUser com Pergunta para obter quiz_id
    respostas = (
        db.query(
            subquery.c.quiz_id,
            RespostaUser.correta
        )
        .join(subquery, RespostaUser.pergunta_id == subquery.c.id)
        .filter(RespostaUser.user_id == user_id)
        .all()
    )

    if not respostas:
        return {
            "total_quizzes": 0,
            "media_percentagem_acertos": 0.0
        }

    quizzes = {}
    for quiz_id, correta in respostas:
        quizzes.setdefault(quiz_id, {"total": 0, "corretas": 0})
        quizzes[quiz_id]["total"] += 1
        if correta:
            quizzes[quiz_id]["corretas"] += 1

    total_quizzes = len(quizzes)
    soma_percentagens = 0

    for q in quizzes.values():
        percentagem = (q["corretas"] / q["total"]) * 100
        soma_percentagens += percentagem

    media_percentagem = soma_percentagens / total_quizzes

    return {
        "total_quizzes": total_quizzes,
        "media_percentagem_acertos": round(media_percentagem, 2)
    }