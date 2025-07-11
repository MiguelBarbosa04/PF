from sqlalchemy.orm import Session
from backend.database.models import Session as Sessions
from backend.schemas.sessions import SessionCreate, SessionUpdate

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

def update_session(db: Session, session_id: int, update_data: SessionUpdate):
    db_session = db.query(Sessions).filter(Sessions.id == session_id).first()
    if not db_session:
        return None

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(db_session, key, value)

    db.commit()
    db.refresh(db_session)
    return db_session

def delete_session(db: Session, session_id: int):
    db_session = db.query(Sessions).filter(Sessions.id == session_id).first()
    if not db_session:
        return False

    db.delete(db_session)
    db.commit()
    return True