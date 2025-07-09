from sqlalchemy.orm import Session
from backend.database.models import Session as DBSession, Messages as DBMessage

def get_or_create_session(db: Session, user_id: int):
    session = db.query(DBSession).filter_by(user_id=user_id).order_by(DBSession.inicio.desc()).first()
    if not session:
        session = DBSession(user_id=user_id)
        db.add(session)
        db.commit()
        db.refresh(session)
    return session

def save_message(db: Session, session_id: int, remetente: str, conteudo: str):
    message = DBMessage(session_id=session_id, remetente=remetente, conteudo=conteudo)
    db.add(message)
    db.commit()
