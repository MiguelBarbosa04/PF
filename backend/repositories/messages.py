from sqlalchemy.orm import Session
from backend.database.models import Messages
from backend.schemas.messages import MessageCreate

def create_message(db: Session, message_data: MessageCreate):
    new_message = Messages(**message_data.dict())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

def get_messages_by_session(db: Session, session_id: int):
    return db.query(Messages).filter(Messages.session_id == session_id).all()

def update_message_rating(db: Session, message_id: int, rating: int):
    db_message = db.query(Messages).filter(Messages.id == message_id).first()
    if db_message:
        db_message.avaliacao = rating
        db.commit()
        db.refresh(db_message)
    return db_message

def delete_message(db: Session, message_id: int):
    db_message = db.query(Messages).filter(Messages.id == message_id).first()
    if db_message:
        db.delete(db_message)
        db.commit()
    return db_message