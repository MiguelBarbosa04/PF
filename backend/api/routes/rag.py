from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.rag_service import generate_rag_response

router = APIRouter()

class RAGRequest(BaseModel):
    query: str

@router.post("/rag")
async def get_rag_response(request: RAGRequest):
    resposta = await generate_rag_response(request.query)
    return {"resposta": resposta}

