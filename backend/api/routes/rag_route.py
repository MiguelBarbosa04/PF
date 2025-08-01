from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.rag_service import generate_rag_response
from fastapi import Depends
from backend.api.routes.users_route import get_current_user, get_db
from sqlalchemy.orm import Session
from backend.database.models import Users

router = APIRouter()

class RAGRequest(BaseModel):
    query: str

@router.post("/rag")
async def get_rag_response(
    request: RAGRequest,
    modo: str = "exploratório",
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    resposta = await generate_rag_response(request.query, db, current_user, modo)
    return {"resposta": resposta}