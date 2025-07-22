from fastapi import APIRouter, HTTPException
import shutil
from backend.database.db import get_db
from backend.database.models import Tema
from backend.services import chroma_service
from backend.services.chroma_service import *
from sqlalchemy.orm import Session
from fastapi import Depends
import os
import gc
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
        # 1. Apagar coleção do ChromaDB
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        client.delete_collection(name=COLLECTION_NAME)

        # 2. Libertar recursos (garantir que ficheiros são fechados)
        del client
        gc.collect()

        limpar_base_sqlite(os.path.join(CHROMA_PATH, "chroma.sqlite3"))

        # 3. Apagar todos os ficheiros da pasta chroma/, exceto chromas.qlite3
        if os.path.exists(CHROMA_PATH):
            for filename in os.listdir(CHROMA_PATH):
                file_path = os.path.join(CHROMA_PATH, filename)
                if os.path.isfile(file_path) and filename != "chroma.sqlite3":
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)

        # 4. Apagar todos os ficheiros da pasta data/
        if os.path.exists(DATA_PATH):
            for root, dirs, files in os.walk(DATA_PATH):
                for file in files:
                    os.remove(os.path.join(root, file))
                for dir in dirs:
                    shutil.rmtree(os.path.join(root, dir))
        else:
            os.makedirs(DATA_PATH)

        # 5. Recriar coleção se necessário
        chromadb.PersistentClient(path=CHROMA_PATH).get_or_create_collection(name=COLLECTION_NAME)

        return {"message": "Coleção e ficheiros apagados com sucesso (exceto chromas.qlite3)."}

    except Exception as e:
        print("Erro ao apagar tudo:", str(e))
        return {"error": str(e)}


@router.put("/temas/{nome}")
def update_tema(nome: str, data: dict, db: Session = Depends(get_db)):
    tema = db.query(Tema).filter(Tema.Nome == nome).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema não encontrado")

    nome_antigo = tema.Nome
    nome_novo = data.get("Nome")
    if not nome_novo:
        raise HTTPException(status_code=400, detail="Novo nome é obrigatório")

    tema.Nome = nome_novo
    db.commit()
    db.refresh(tema)

    # Atualizar na ChromaDB
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_collection(COLLECTION_NAME)

        collection.update(
            where={"filename": nome_antigo},
            new_metadatas=[{"filename": nome_novo}]
        )
    except Exception as e:
        print("Erro ao atualizar metadados na ChromaDB:", e)

    return {"message": "Tema atualizado com sucesso"}

@router.delete("/temas/{nome}")
def delete_tema(nome: str, db: Session = Depends(get_db)):
    tema = db.query(Tema).filter(Tema.Nome == nome).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema não encontrado")

    db.delete(tema)
    db.commit()

    # Apagar da ChromaDB pelo nome
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_collection(COLLECTION_NAME)

        collection.delete(where={"filename": nome})
    except Exception as e:
        print("Erro ao apagar vetor da ChromaDB:", e)

    return {"message": "Tema apagado com sucesso"}
