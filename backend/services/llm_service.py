from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter

DATA_PATH = "data"
CHROMA_PATH = "chroma_db"
COLLECTION_NAME = "documentos"

# Inicializa cliente Chroma local persistente
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

# Cria ou obtém coleção
collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

# Embedding: HuggingFace atualizado
embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Exemplo função para carregar, dividir e indexar PDFs
def carregar_e_indexar_pdfs():
    loader = PyPDFLoader(DATA_PATH)
    raw_docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )

    chunks = splitter.split_documents(raw_docs)

    documents = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]
    ids = [f"doc{i}" for i in range(len(chunks))]

    # Upsert para a coleção Chroma
    collection.upsert(documents=documents, metadatas=metadatas, ids=ids)

# Exemplo função para consulta
def consultar_rag(query: str, n_results=4):
    results = collection.query(query_texts=[query], n_results=n_results)
    return results['documents']

def get_chroma_collection():
    return chroma_client.get_or_create_collection(name=COLLECTION_NAME)

