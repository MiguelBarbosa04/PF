import chromadb
import httpx
import json

CHROMA_PATH = "chroma/"
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(name="tutor_agent_docs")

async def generate_rag_response(user_query: str) -> str:
    results = collection.query(query_texts=[user_query], n_results=4)
    retrieved_docs = results.get("documents", [[]])[0] if results else []

    if not retrieved_docs:
        return "Não sei. Não foram encontrados documentos relevantes."

    system_prompt = f"""
    Responde à pergunta do utilizador apenas com base nos dados seguintes. Não inventes nada.
    Se não souberes a resposta, diz: Não sei.

    Dados:e
    {'\n'.join(retrieved_docs)}
    """

    mistral_request = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ]
    }

    resposta = ""
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post("http://localhost:11434/api/chat", json=mistral_request)

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