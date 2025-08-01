from fastapi import APIRouter
from fastapi.responses import JSONResponse
from backend.services.chroma_service import collection
import uuid
import re
import unicodedata

STOPWORDS = {"a", "o", "de", "que", "e", "as", "os", "um", "uma", "do", "da", "dos", "das", "em", "por", "para", "com", "sem"}

def normalizar_e_ordenar(texto: str) -> str:
    # Remove acentos
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    texto = texto.lower()
    # Remove pontuação
    texto = re.sub(r'[^\w\s]', '', texto)
    # Quebra em palavras
    palavras = texto.split()
    # Remove stopwords
    palavras = [p for p in palavras if p not in STOPWORDS]
    # Ordena alfabeticamente
    palavras.sort()
    # Junta de volta em string
    return ' '.join(palavras)

def existe_pergunta_na_chroma(pergunta: str) -> bool:
    pergunta_normalizada = normalizar_e_ordenar(pergunta)

    resultados = collection.get(limit=1000)
    for meta in resultados.get('metadatas', []):
        if meta and "pergunta" in meta:
            meta_pergunta = normalizar_e_ordenar(meta["pergunta"])
            if meta_pergunta == pergunta_normalizada:
                return True
    return False

def indexar_qa_pergunta_resposta(pergunta: str, resposta: str, modelo: str = None):
    """
    Indexa um par pergunta–resposta diretamente na base vetorial.
    """
    pergunta_normalizada = normalizar_e_ordenar(pergunta)
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
    documentos = []
    for doc, meta in zip(results['documents'], results['metadatas']):
        # print("📄 Documento:", doc)
        # print("🔖 Metadata:", meta)
        # print("---")
        documentos.append({
            "documento": doc,
            "metadata": meta
        })

    return JSONResponse(content=documentos)