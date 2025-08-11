from pydantic import BaseModel
from datetime import datetime

class GlobalSettingsBase(BaseModel):
    id: int
    modelo: str
    atualizado_em: datetime

    class Config:
        orm_mode = True

class GlobalSettingsCreate(BaseModel):
    modelo: str