import os
import httpx
import json
import re

from sqlalchemy.orm import Session as DBSession
from backend.database.models import Users
from backend.repositories.global_settings_repository import get_global_settings
from backend.services.llm_service import get_chroma_collection
from dotenv import load_dotenv


load_dotenv()

GEMINI_URL = os.getenv('GEMINI_URL')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OLLAMA_URL = os.getenv('OLLAMA_URL')

def limpar_json_markdown(texto: str) -> str:
    """Remove blocos de markdown tipo ```json ... ```"""
    return re.sub(r"^```json\s*|\s*```$", "", texto.strip(), flags=re.IGNORECASE)

def query_prioritaria_por_source(collection, user_query: str, n_results: int = 4, limiar_distancia: float = 0.1):
    # Query aos pares 5 estrelas
    resultados_5estrelas = collection.query(
        query_texts=[user_query],
        n_results=n_results,
        where={"source": "feedback_5_estrelas"},
        include=["documents", "distances"]
    )
    docs_5 = resultados_5estrelas.get("documents", [[]])[0]
    dist_5 = resultados_5estrelas.get("distances", [[]])[0]

    # Se existir algum próximo o suficiente, retorna esses
    if dist_5 and len(dist_5) > 0 and min(dist_5) < limiar_distancia:
        return resultados_5estrelas

    # Senão, retorna os documentos gerais
    resultados_gerais = collection.query(
        query_texts=[user_query],
        n_results=n_results,
        include=["documents", "distances"]
    )
    return resultados_gerais

async def generate_rag_response(
    user_query: str,
    db: DBSession,
    current_user: Users,
    modo: str = "exploratório",
    papel: str = "Agente"
) -> str:
    print("Modo recebido:", modo)
    print("PAPEL: ", papel)

    # Obter documentos do ChromaDB
    # collection = get_chroma_collection()
    # results = collection.query(query_texts=[user_query], n_results=4)
    # retrieved_docs = results.get("documents", [[]])[0] if results else []

    collection = get_chroma_collection()
    results = query_prioritaria_por_source(collection, user_query, n_results=4, limiar_distancia=0.1)
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
    estilo_modo = "A tua missão é responder com base unicamente nos documentos fornecidos."
    if papel == "Tutor":
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
        "NUNCA escrevas prefixos como 'PERGUNTA:', 'RESPOSTA:', 'Question:', 'Answer:', "
        "'Resposta:', 'Pergunta:', 'ANSWER:', 'ANS:', 'R:'. "
        "Começa sempre diretamente com a resposta, sem qualquer palavra antes."
        "ATENÇÃO: Não deves usar conhecimento externo. "
        "Não inventes informações. "  
        "Se a resposta não estiver claramente nos documentos abaixo, responde apenas com: "
        "\"Essa informação não está disponível nos documentos fornecidos.\""
        "Se fizerem a pergunta em inglês responde em inglês"
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
    Gera um quiz com perguntas de múltipla escolha sobre o tema: {tema}.
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
    Responde apenas com JSON puro. Sem introduções, comentários ou explicações adicionais.
    Se as perguntas no chat tiverem em inglês faz o quiz em inglês.
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
            resposta_raw = data["candidates"][0]["content"]["parts"][0]["text"]
            print("🧪 RESPOSTA RAW DO GEMINI:\n", resposta_raw)

            if not resposta_raw.strip():
                raise ValueError("Resposta vazia recebida do Gemini.")

            resposta_limpa = limpar_json_markdown(resposta_raw)
            return json.loads(resposta_limpa)

        except (KeyError, json.JSONDecodeError) as e:
            print("❌ Erro ao processar resposta do Gemini:", e)
            print("🔴 Conteúdo bruto:\n", data)
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