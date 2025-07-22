from sqlalchemy import Column, Integer, String
from pydantic import BaseModel

class TemaSchema(BaseModel):
    Nome: str

    model_config = {
        "from_attributes": True
    }

class TemaUpdateRequest(BaseModel):
    nome_novo: str