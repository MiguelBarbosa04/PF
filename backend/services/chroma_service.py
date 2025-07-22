import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
import sqlite3

client = chromadb.PersistentClient(path="./chroma")
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

    filename_with_ext = os.path.basename(file_path)
    filename = os.path.splitext(filename_with_ext)[0]

    for chunk in chunks:
        chunk.metadata["filename"] = filename

    documents = [chunk.page_content for chunk in chunks]
    metadata = [chunk.metadata for chunk in chunks]
    ids = [f"{os.path.basename(file_path)}chunk{i}" for i in range(len(chunks))]

    collection.upsert(documents=documents, metadatas=metadata, ids=ids)
    return len(chunks)

def update_tema_vector(id: int, nome: str):
    # Remove e reinsere o documento com o novo nome
    delete_tema_vector(id)
    collection.add(
        documents=[nome],
        ids=[str(id)],
        metadatas=[{"id": id}]
    )

def delete_tema_vector(id: int):
    collection.delete(ids=[str(id)])

def limpar_base_sqlite(path_db="chroma/chroma.sqlite3"):
        try:
            conn = sqlite3.connect(path_db)
            cursor = conn.cursor()

            # Desativar chaves estrangeiras temporariamente
            cursor.execute("PRAGMA foreign_keys = OFF;")

            # Eliminar dados das tabelas principais
            cursor.execute("DELETE FROM collections;")
            cursor.execute("DELETE FROM collection_metadata;")
            cursor.execute("DELETE FROM embeddings;")

            conn.commit()
            conn.close()
            print("Base de dados SQLite limpa com sucesso.")
        except Exception as e:
            print("Erro ao limpar chroma.sqlite3:", str(e))