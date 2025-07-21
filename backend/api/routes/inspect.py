from fastapi import APIRouter
import chromadb

router = APIRouter(prefix="/inspect-colecao", tags=["Inspeção"])

CHROMA_PATH = "chroma/"
COLLECTION_NAME = "tutor_agent_docs"

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
            "trechos_documentos": len(results["documents"]),
            "documentos": results["documents"],
            "metadados": results["metadatas"]
        }
