from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.schemas.global_settings_schema import GlobalSettingsBase, GlobalSettingsCreate
from backend.repositories.global_settings_repository import get_global_settings, create_or_update_global_settings
from backend.database.db import get_db

router = APIRouter(prefix="/global-settings", tags=["Global Settings"])

@router.get("/", response_model=GlobalSettingsBase)
def read_global_settings(db: Session = Depends(get_db)):
    settings = get_global_settings(db)
    if not settings:
        raise HTTPException(status_code=404, detail="Configuração global não encontrada")
    return settings

@router.put("/", response_model=GlobalSettingsBase)
def update_global_settings(payload: GlobalSettingsCreate, db: Session = Depends(get_db)):
    settings = create_or_update_global_settings(db, payload)
    return settings