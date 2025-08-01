from sqlalchemy.orm import Session
from backend.database.models import GlobalSettings
from backend.schemas.global_settings_schema import GlobalSettingsCreate
from datetime import datetime

def get_global_settings(db: Session) -> GlobalSettings | None:
    """Retorna a única linha de configurações globais (assumindo 1 só)."""
    return db.query(GlobalSettings).first()

def create_or_update_global_settings(db: Session, settings_in: GlobalSettingsCreate) -> GlobalSettings:
    """Cria ou atualiza as configurações globais."""
    settings = get_global_settings(db)
    if settings:
        settings.modelo = settings_in.modelo
        settings.atualizado_em = datetime.utcnow()
    else:
        settings = GlobalSettings(modelo=settings_in.modelo, atualizado_em=datetime.utcnow())
        db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

def obter_modelo_mais_recente(db: Session) -> str:
    setting = (
        db.query(GlobalSettings)
        .order_by(GlobalSettings.atualizado_em.desc())
        .first()
    )
    return setting.modelo if setting else "ollama"