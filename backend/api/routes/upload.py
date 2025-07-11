import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from backend.services.llm_service import get_chroma_collection

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Só PDFs são permitidos")

    upload_folder = "temp_uploads"
    os.makedirs(upload_folder, exist_ok=True)
    temp_file_path = os.path.join(upload_folder, file.filename)

    # Guardar o ficheiro temporariamente
    contents = await file.read()
    temp_file_path = f"temp_uploads/{file.filename}"
    with open(temp_file_path, "wb") as f:
        f.write(contents)

    # Carregar documento PDF
    loader = PyPDFLoader(temp_file_path)
    documents = loader.load()

    # Partir em chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(documents)

    # Pegar a coleção Chroma
    collection = get_chroma_collection()

    # Preparar dados para upsert
    docs = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]
    ids = [f"{file.filename}_chunk_{i}" for i in range(len(chunks))]

    # Guardar chunks no Chroma
    collection.upsert(documents=docs, metadatas=metadatas, ids=ids)

    return {"message": f"Ficheiro {file.filename} carregado e processado com sucesso."}
