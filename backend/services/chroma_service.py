import os
import chromadb
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_PATH = "data"
CHROMA_PATH = "chroma_db"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(name="tutor_agent_docs")

def load_and_store_documents():
    loader = PyPDFLoader(DATA_PATH)
    raw_documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(raw_documents)

    documents, metadata, ids = [], [], []
    for i, chunk in enumerate(chunks):
        documents.append(chunk.page_content)
        metadata.append(chunk.metadata)
        ids.append(f"ID{i}")

    collection.upsert(documents=documents, metadatas=metadata, ids=ids)

    return len(documents)