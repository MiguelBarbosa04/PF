import uuid

import unicodedata

from backend.services.chroma_service import collection

def normalizar(texto: str) -> str:
    # Remove acentos, põe tudo lowercase, remove espaços extra
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return ' '.join(texto.lower().strip().split())

def existe_pergunta_na_chroma(pergunta: str) -> bool:
    pergunta_normalizada = normalizar(pergunta)

    resultados = collection.get(limit=1000)
    for meta in resultados.get('metadatas', []):
        if meta and "pergunta" in meta:
            meta_pergunta = normalizar(meta["pergunta"])
            if meta_pergunta == pergunta_normalizada:
                return True
    return False

def indexar_qa_pergunta_resposta(pergunta: str, resposta: str, modelo: str = None):
    """
    Indexa um par pergunta–resposta diretamente na base vetorial.
    """
    pergunta_normalizada = normalizar(pergunta)
    doc = f"PERGUNTA: {pergunta_normalizada}\nRESPOSTA: {resposta}"
    metadata = {"source": "feedback_5_estrelas", "pergunta": pergunta_normalizada}
    if modelo:
        metadata["modelo"] = modelo

    # Antes de inserir, verificar se já existe na base
    if not existe_pergunta_na_chroma(pergunta):
        id_qa = str(uuid.uuid4())
        collection.upsert(
            documents=[doc],
            metadatas=[metadata],
            ids=[id_qa]
        )
    else:
        print("❗ Pergunta já indexada, a ignorar.")

def listar_documentos_chroma(limit: int = 10):
    results = collection.get(limit=limit)
    for doc, meta in zip(results['documents'], results['metadatas']):
        print("📄 Documento:", doc)
        print("🔖 Metadata:", meta)
        print("---")