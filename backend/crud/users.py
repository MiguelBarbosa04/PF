from backend.database.models import Users
from backend.schemas.users import UserCreate
from sqlalchemy.orm import Session

def create_user(db: Session, user: UserCreate):
    db_user = Users(
        id=user.id,
        nome=user.nome,
        email=user.email,
        experiencia=user.experiencia,
        funcao=user.funcao,
        ling_preferida=user.ling_preferida,
        pin=user.pin,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user