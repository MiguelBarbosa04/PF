from sqlalchemy.orm import Session
from backend.database.models import Session as DBSession
from backend.schemas.sessions import SessionCreate
from datetime import datetime
from sqlalchemy import and_

def get_or_create_session(db: DBSession, session_data: SessionCreate) -> int:
    existing = db.query(Session).filter(
        and_(
            Session.user_id == session_data.user_id,
            Session.papel == session_data.papel,
            Session.tema == session_data.tema
        )
    ).first()

    if existing:
        return existing.id

    nova_sessao = Session(
        user_id=session_data.user_id,
        papel=session_data.papel,
        tema=session_data.tema,
        inicio=session_data.inicio or datetime.utcnow()
    )
    db.add(nova_sessao)
    db.commit()
    db.refresh(nova_sessao)
    return nova_sessao.id