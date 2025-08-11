import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from backend.services.chroma_service import load_and_store_documents
from backend.services.llm_service import get_chroma_collection

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    storage_folder = "data/"
    os.makedirs(storage_folder, exist_ok=True)

    # Remove a extensão .pdf (se existir) do nome do ficheiro
    original_filename = file.filename
    if not original_filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Só PDFs são permitidos")

    filename_base = original_filename.removesuffix(".pdf")

    file_path = os.path.join(storage_folder, f"{filename_base}")

    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="Esse ficheiro já existe, por favor mude o nome.")

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    collection = get_chroma_collection()
    num_chunks = load_and_store_documents(file_path, collection)

    return {
        "message": f"Ficheiro {filename_base} guardado em 'data/' e indexado com sucesso.",
        "chunks_indexados": num_chunks
    }
