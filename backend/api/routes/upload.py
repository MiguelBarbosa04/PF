import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from backend.services.llm_service import get_chroma_collection

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):

    # Diretório onde os PDFs serão guardados permanentemente
    storage_folder = "data/"
    os.makedirs(storage_folder, exist_ok=True)
    file_path = os.path.join(storage_folder, file.filename)

    #Se o nome for igual não deixa fazer upload
    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="Esse ficheiro já existe, por favor mude o nome.'")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Só PDFs são permitidos")


    # Guardar o ficheiro permanentemente
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Carregar e processar o documento PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(documents)

    # Indexar no ChromaDB
    collection = get_chroma_collection()
    docs = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]
    ids = [f"{file.filename}_chunk_{i}" for i in range(len(chunks))]

    collection.upsert(documents=docs, metadatas=metadatas, ids=ids)

    return {"message": f"Ficheiro {file.filename} guardado em 'data/' e indexado com sucesso."}