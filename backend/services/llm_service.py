from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import OllamaEmbeddings  # <- usa o mesmo que na consulta
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
import chromadb

CHROMA_PATH = "chroma/"
DATA_PATH = "data/"
COLLECTION_NAME = "tutor_agent_docs"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
def carregar_e_indexar_pdfs():
    loader = PyPDFLoader(DATA_PATH)
    raw_docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
    )
    chunks = splitter.split_documents(raw_docs)

    # Embeddings com Ollama (mistral)
    embeddings = OllamaEmbeddings(model="mistral")

    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )

    vectordb.persist()
    print("✅ Documentos indexados com sucesso.")

def get_chroma_collection():
    return chroma_client.get_or_create_collection(name=COLLECTION_NAME)