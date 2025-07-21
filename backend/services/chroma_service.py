
import os
import chromadb
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_PATH = "data"
CHROMA_PATH = "chroma/"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(name="tutor_agent_docs")

def load_and_store_documents(file_path: str, collection) -> int:
    loader = PyPDFLoader(file_path)
    raw_documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(raw_documents)

    documents = [chunk.page_content for chunk in chunks]
    metadata = [chunk.metadata for chunk in chunks]
    ids = [f"{os.path.basename(file_path)}chunk{i}" for i in range(len(chunks))]

    collection.upsert(documents=documents, metadatas=metadata, ids=ids)
    return len(chunks)