import chromadb
import httpx

CHROMA_PATH = "chroma_db"
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(name="tutor_agent_docs")

async def generate_rag_response(user_query: str) -> str:
    results = collection.query(query_texts=[user_query], n_results=4)
    retrieved_docs = results.get("documents", [[]])[0] if results else []

    system_prompt = f"""
    Responde à pergunta do utilizador apenas com base nos dados seguintes. Não inventes nada.
    Se não souberes a resposta, diz: Não sei.

    Dados:
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
                    data = httpx.Response(200, content=line)
                    content = data.json().get("message", {}).get("content")
                    if content:
                        resposta += content
                except Exception:
                    continue

    return resposta.strip() if resposta else "Não foi possível gerar resposta."