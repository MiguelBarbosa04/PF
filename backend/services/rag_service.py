import os
import httpx
import json
import requests

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
    modo: str = "exploratório"
) -> str:
    print("Modo recebido:", modo)

    # Obter documentos do ChromaDB
    collection = get_chroma_collection()
    results = collection.query(query_texts=[user_query], n_results=4)
    retrieved_docs = results.get("documents", [[]])[0] if results else []

    if not retrieved_docs:
        return "Não sei. Não foram encontrados documentos relevantes."

    # Modelo definido nas configurações globais
    settings = get_global_settings(db)
    modelo = settings.modelo if settings else "mistral"
    url = OLLAMA_URL if modelo in ["mistral", "llama3"] else GEMINI_URL

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
            "Simplifica termos técnicos, evita jargões e escreve de forma direta e leve."
        )
    else:
        estilo_base = (
            "Usa um tom formal, profissional e técnico. Evita expressões coloquiais. "
            "Utiliza vocabulário mais preciso e técnico, frases completas, e uma estrutura clara e objetiva."
        )

    # Estilo com base no modo
    if modo == "instrucional":
        estilo_modo = (
            "A tua missão é ensinar o utilizador sobre o tema com base apenas nos documentos fornecidos. "
            "Ensina passo a passo como se estivesses a dar uma aula. "
            "Estrutura a resposta com listas, tópicos e exemplos simples."
        )
    else:
        estilo_modo = (
            "A tua missão é responder de forma direta, útil e objetiva, com base unicamente nos documentos fornecidos."
        )

    # Regras de restrição (com reforço claro)
    regras = (
        "ATENÇÃO: Não deves usar conhecimento externo. "
        "Não inventes informações. "
        "Se a resposta não estiver claramente nos documentos abaixo, responde apenas com: "
        "\"Essa informação não está disponível nos documentos fornecidos.\""
    )

    estilo_texto = f"{estilo_base}\n\n{estilo_modo}\n\n{regras}"

    # Prompt final
    system_prompt = f"""
És um assistente de IA técnico e especializado. 
Só podes responder com base nos documentos fornecidos abaixo.

{estilo_texto}

--- Documentos disponíveis ---
{chr(10).join(retrieved_docs)}
"""

    resposta = ""
    async with httpx.AsyncClient(timeout=60) as client:
        if modelo in ["mistral", "llama3"]:
            model_request = {
                "model": modelo,
                "messages": [
                    {"role": "system", "content": system_prompt.strip()},
                    {"role": "user", "content": f"Baseando-te apenas nos documentos fornecidos, responde a esta pergunta: {user_query.strip()}"}
                ],
                "temperature": 0.3
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
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": f"{system_prompt.strip()}\n\nPergunta: {user_query.strip()}"
                            }
                        ]
                    }
                ]
            }

            response = await client.post(url, headers=headers, json=model_request)
            data = response.json()

            try:
                resposta = data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception:
                resposta = "Não foi possível gerar resposta com Gemini."

    return resposta.strip() if resposta else "Não foi possível gerar resposta."



async def gerar_quiz_gemini(tema: str) -> dict:
    prompt = f"""
    Gera um quiz com 5 perguntas de múltipla escolha sobre o tema: {tema}.
    Retorna em JSON com perguntas, opções e qual é a correta:
    {{
        "titulo": "...",
        "descricao": "...",
        "perguntas": [
            {{
                "enunciado": "...",
                "opcoes": [
                    {{"texto": "...", "correta": true/false}},
                    ...
                ]
            }}
        ]
    }}
    """

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(GEMINI_URL, headers=headers, json={
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        })

        data = response.json()

        try:
            resposta = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(resposta)
        except Exception:
            raise ValueError("Não foi possível gerar quiz com Gemini.")


async def gerar_quiz_ollama(tema: str) -> dict:
    prompt = f"""
    Gera um quiz com 5 perguntas de múltipla escolha sobre o tema: {tema}.
    Retorna em formato JSON com esta estrutura:
    {{
        "titulo": "Título do quiz",
        "descricao": "Descrição breve",
        "perguntas": [
            {{
                "enunciado": "Pergunta...",
                "opcoes": [
                    {{"texto": "Opção 1", "correta": false}},
                    {{"texto": "Opção 2", "correta": true}},
                    ...
                ]
            }}
        ]
    }}
    """

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OLLAMA_URL, json={
            "model": "mistral",
            "messages": [
                {"role": "system", "content": "Gera quizzes no formato especificado."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        })

        full_response = ""
        async for line in response.aiter_lines():
            if line.strip():
                try:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content")
                    if content:
                        full_response += content
                except Exception:
                    continue

    print("Resposta bruta do Ollama:", repr(full_response))

    if not full_response.strip():
        raise ValueError("Resposta do Ollama está vazia.")

    import re
    json_match = re.search(r"\{.*\}", full_response, re.DOTALL)
    if json_match:
        json_text = json_match.group(0)
        return json.loads(json_text)
    else:
        raise ValueError("Não foi possível extrair JSON da resposta do Ollama.")


async def gerar_quiz_com_rag(tema: str, modelo: str = "gemini") -> dict:
    if modelo == "gemini":
        return await gerar_quiz_gemini(tema)
    elif modelo == "mistral":
        return await gerar_quiz_ollama(tema)
    else:
        raise ValueError(f"Modelo desconhecido: {modelo}")
