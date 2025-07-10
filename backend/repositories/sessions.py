from sqlalchemy.orm import Session
from backend.database.models import Session as Sessions
from backend.schemas.sessions import SessionCreate

def create_session(db: Session, session_data: SessionCreate):
    new_session = Sessions(**session_data.dict())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

def get_session(db: Session, session_id: int):
    return db.query(Sessions).filter(Sessions.id == session_id).first()

def get_sessions_by_user(db: Session, user_id: int):
    return db.query(Sessions).filter(Sessions.user_id == user_id).all()