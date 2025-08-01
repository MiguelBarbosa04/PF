from fastapi import APIRouter
from backend.repositories import chroma_repository

router = APIRouter(prefix="/chroma", tags=["chroma"])

@router.get("/documentos")
def listar_documentos(limit: int = 10):
    return chroma_repository.listar_documentos_chroma(limit)