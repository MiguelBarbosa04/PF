import os
import httpx
import json
from sqlalchemy.orm import Session as DBSession
from backend.database.models import Users
from backend.repositories.global_settings import get_global_settings
from backend.services.llm_service import get_chroma_collection
from dotenv import load_dotenv


load_dotenv()

GEMINI_URL = os.getenv('GEMINI_URL')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OLLAMA_URL = os.getenv('OLLAMA_URL')


async def generate_rag_response(
    user_query: str,
    db: DBSession,
    current_user: Users,
    modo: str = "exploratório"  # novo parâmetro
) -> str:
    print("Modo recebido:", modo)

    # Obter documentos do ChromaDB
    collection = get_chroma_collection()
    results = collection.query(query_texts=[user_query], n_results=4)
    retrieved_docs = results.get("documents", [[]])[0] if results else []

    # Modelo definido nas configurações globais
    settings = get_global_settings(db)
    modelo = settings.modelo if settings else "mistral"

    url = OLLAMA_URL if modelo in ["mistral"] else GEMINI_URL

    # Se não houver documentos, retorna mensagem padrão
    if not retrieved_docs:
        return "Não sei. Não foram encontrados documentos relevantes."

    # Cabeçalhos para Gemini
    headers = {}
    if modelo == "gemini":
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY
        }

    # Estilo com base na linguagem do utilizador
    linguagem = current_user.ling_preferida
    if linguagem == "Informal":
        estilo_base = (
            "Usa um tom informal e descontraído, como se estivesses a conversar com um colega ou amigo. "
            "Simplifica termos técnicos, evita jargões e escreve de forma direta e leve. "
            "É permitido usar exemplos simples ou expressões comuns do dia a dia."
        )
    else:
        estilo_base = (
            "Usa um tom formal, profissional e técnico. Evita expressões coloquiais. "
            "Utiliza vocabulário mais preciso e técnico, frases completas, e uma estrutura clara e objetiva. "
            "Escreve como se estivesses a preparar um relatório para uma organização ou apresentação académica."
        )

    # Estilo com base no modo (exploratório ou instrucional)
    if modo == "instrucional":
        estilo_modo = (
            "A tua missão é ensinar o utilizador sobre o tema. Ensina e explica os conceitos passo a passo como se estivesses a dar uma aula. "
            "Apresenta os pontos principais com estrutura clara."
            "Estruturado, didático e sequencial"
            "Usa listas, tópicos e exemplos simples sempre que possível para facilitar a compreensão."
        )
    else:
        estilo_modo = (
            "A tua missão é responder de forma direta, útil e objetiva com base nos documentos fornecidos, sem necessidade de ensinar ou aprofundar."
        )

    estilo_texto = f"{estilo_base}\n\n{estilo_modo}"

    # Prompt final
    system_prompt = f"""
        És um assistente de IA especializado em responder a perguntas com base em documentos técnicos, manuais e instruções operacionais fornecidos.
        A tua principal diretriz é usar apenas as informações fornecidas no documento de contexto para responder às perguntas do utilizador.
        Não utilizes conhecimento externo.
        Caso a resposta não esteja no texto fornecido, deves dizer claramente que essa informação não está disponível no documento.
        {estilo_texto}

        Documentos disponíveis:
        {'\n'.join(retrieved_docs)}
    """

    resposta = ""
    async with httpx.AsyncClient(timeout=60) as client:
        if modelo in ["mistral"]:
            model_request = {
                "model": modelo,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "temperature": 0.5
            }
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

        elif modelo == "gemini":
            model_request = {
                "contents": [
                    {"role": "user", "parts": [{"text": system_prompt + "\nPergunta: " + user_query}]}
                ]
            }

            response = await client.post(url, headers=headers, json=model_request)
            data = response.json()

            try:
                resposta = data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception:
                resposta = "Não foi possível gerar resposta com Gemini."

    return resposta.strip() if resposta else "Não foi possível gerar resposta."
