from fastapi import APIRouter, HTTPException
import chromadb
import os
import shutil
from backend.database.models import *

router = APIRouter(prefix="/inspect-colecao", tags=["Inspeção"])

CHROMA_PATH = "chroma/"
COLLECTION_NAME = "tutor_agent_docs"
DATA_PATH = "data/"

@router.get("/")
def inspect_collection():
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    try:
        collection = client.get_collection(COLLECTION_NAME)
        results = collection.get()
        total = len(results["documents"])
        return {"colecao": COLLECTION_NAME, "total_documentos": total}
    except Exception as e:
        return {"erro": str(e)}

@router.get("/detalhes")
def detalhes_collection(limit: int = 5):
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_collection(COLLECTION_NAME)
        results = collection.get(limit=limit)
        return {
            "total_documentos": len(results["documents"]),
            "documentos": results["documents"],
            "metadados": results["metadatas"]
        }


@router.get("/temas")
def listar_temas():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_collection(COLLECTION_NAME)

    metadatas = collection.get(include=["metadatas"])["metadatas"]
    nomes = list({meta["filename"] for meta in metadatas if "filename" in meta})

    return [{"Nome": nome} for nome in nomes]



@router.delete("/apagar")
def apagar_tudo():
    try:
        # Apaga a coleção do ChromaDB
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        nome_colecao = "tutor_agent_docs"
        client.delete_collection(name=nome_colecao)
        client.get_or_create_collection(name=nome_colecao)

        # Apaga todos os ficheiros dentro da pasta data
        if os.path.exists(DATA_PATH):
            # Remove toda a pasta data com conteúdo
            shutil.rmtree(DATA_PATH)
            # Recria a pasta vazia
            os.makedirs(DATA_PATH)
        else:
            # Se não existir, cria a pasta vazia
            os.makedirs(DATA_PATH)

        return {"message": f"Coleção '{nome_colecao}' e ficheiros em '{DATA_PATH}' apagados com sucesso."}
    except Exception as e:
        return {"error": str(e)}