import chromadb

CHROMA_PATH = "chroma/"
DATA_PATH = "data/"
COLLECTION_NAME = "tutor_agent_docs"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_chroma_collection():
    return chroma_client.get_or_create_collection(name=COLLECTION_NAME)