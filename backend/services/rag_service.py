import chromadb
import httpx
import json
from sqlalchemy.orm import Session as DBSession
from backend.repositories.global_settings import get_global_settings
from backend.services.llm_service import get_chroma_collection

async def generate_rag_response(user_query: str, db: DBSession) -> str:
    collection = get_chroma_collection()
    results = collection.query(query_texts=[user_query], n_results=4)
    retrieved_docs = results.get("documents", [[]])[0] if results else []

    settings = get_global_settings(db)
    modelo = settings.modelo if settings else "mistral"

    url = f"http://localhost:11434/api/chat" if modelo in ["mistral", "llama3"] \
        else "https://generativeai.googleapis.com/v1beta/models/gemini-pro:generateContent"

    if not retrieved_docs:
        return "Não sei. Não foram encontrados documentos relevantes."

    system_prompt = f"""
   És um assistente de IA especializado em responder a perguntas com base em documentos técnicos, manuais, instruções operacionais fornecidos e data.
A sua principal diretriz é usar apenas as informações fornecidas no documento de contexto para responder às perguntas do utilizador.
Não utilize nenhum conhecimento externo.
Caso a resposta não possa ser encontrada no texto fornecido, deves declarar explicitamente que a informação não está disponível no documento.
Seja conciso e responda à pergunta diretamente com base no texto.

    Dados:e
    {'\n'.join(retrieved_docs)}
    """

    model_request = {
        "model": modelo,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ]
    }

    resposta = ""
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=model_request)

        async for line in response.aiter_lines():
            if line.strip():
                try:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content")
                    if content:
                        resposta += content
                except Exception:
                    continue

    return resposta.strip() if resposta else "Não foi possível gerar resposta."