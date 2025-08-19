import os
import json
import re
import httpx
from typing import List, Dict, Any
from sqlalchemy.orm import Session as DBSession
from backend.database.models import Users
from backend.repositories.global_settings_repository import get_global_settings
from backend.services.llm_service import get_chroma_collection
from dotenv import load_dotenv
from langdetect import detect, DetectorFactory
DetectorFactory.seed = 0
load_dotenv()

GEMINI_URL = os.getenv("GEMINI_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OLLAMA_URL = os.getenv("OLLAMA_URL")

def detectar_idioma(texto: str) -> str:
    try:
        codigo = detect(texto)
    except:
        return "português"  # fallback

    if codigo == "en":
        return "inglês"
    elif codigo == "pt":
        return "português"
    else:
        return "português"

def limpar_json_markdown(texto: str) -> str:
    """Remove blocos de markdown tipo ```json ... ``` ou ``` ... ```"""
    if not texto:
        return ""
    t = texto.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE)
    t = re.sub(r"\s*```$", "", t)
    return t.strip()


def dedupe(items: List[str]) -> List[str]:
    vistos = set()
    out = []
    for it in items:
        if not it:
            continue
        if it not in vistos:
            vistos.add(it)
            out.append(it)
    return out


def preparar_documentos_para_prompt(docs: List[str], max_docs: int = 8, max_chars: int = 1500) -> List[str]:
    """Remove duplicados, limpa espaços e corta cada chunk para limitar tokens."""
    docs = dedupe([d.strip() for d in docs if d and d.strip()])
    docs = [d[:max_chars] for d in docs[:max_docs]]
    return docs


def query_prioritaria_por_source(collection, user_query: str, tema: str, n_results: int = 10, limiar_distancia: float = 0.1):
    """Prioriza documentos com source==feedback_5_estrelas.
    caso contrário, combina com query geral
    removendo duplicados e respeitando a ordem de relevância.
    """
    res_5 = collection.query(
        query_texts=[user_query],
        n_results=n_results,
        where={
            "$and": [
                {"source": "feedback_5_estrelas"},
                {"filename": tema}
            ]
        },
        include=["documents", "distances"],
    )
    docs_5 = res_5.get("documents", [[]])[0]
    dist_5 = res_5.get("distances", [[]])[0]

    if dist_5 and len(dist_5) > 0 and min(dist_5) < limiar_distancia:
        return res_5

    res_tema = collection.query(
        query_texts=[user_query],
        n_results=n_results,
        where={"filename": tema},
        include=["documents", "distances"],
    )
    docs_tema = res_tema.get("documents", [[]])[0]
    dist_tema = res_tema.get("distances", [[]])[0]

    vistos = set()
    documentos: List[str] = []
    distancias: List[float] = []

    for doc, dist in list(zip(docs_5, dist_5)) + list(zip(docs_tema, dist_tema)):
        if doc not in vistos:
            vistos.add(doc)
            documentos.append(doc)
            distancias.append(dist)

    return {"documents": [documentos[:n_results]], "distances": [distancias[:n_results]]}


def construir_system_prompt(estilo_base: str, linguagem_tom: str, linguagem_detetada: str, documentos: List[str], user_query: str, papel: str, modo: str) -> str:

    if papel == "Tutor":
        if modo == "instrucional":
            estilo_modo = (
                "Ensina passo a passo com base apenas nos documentos fornecidos. "
                "Estrutura a resposta com listas, tópicos e exemplos simples."
            )
        else:
            estilo_modo = (
                "Responde de forma direta, útil e objetiva, sempre com base apenas nos documentos."
            )
    else:
        estilo_modo = "Responde com base apenas nos documentos fornecidos."

    regras = (
        f"Responde sempre no idioma {linguagem_detetada}.\n"
        f"O tom de escrita deve ser {linguagem_tom}.\n"
        "Use **exclusivamente** os documentos fornecidos abaixo.\n"
        "Se a informação necessária não estiver nos documentos, responda exatamente:\n"
        "'Essa informação não está disponível nos documentos fornecidos.'\n"
        "Não invente fatos, não utilize conhecimento prévio ou externo.\n"
        "NUNCA escreva prefixos como 'PERGUNTA:', 'RESPOSTA:', 'Question:', 'Answer:', "
        "'Resposta:', 'Pergunta:', 'ANSWER:', 'ANS:', 'R:'. "
        "Comece sempre diretamente com a resposta, sem qualquer palavra antes."
    )

    blocos = [
        "És um assistente de IA técnico e especializado.",
        estilo_base,
        estilo_modo,
        regras,
        "--- Documentos ---",
        "\n".join(documentos),
        "--- Pergunta ---",
        user_query.strip(),
        "\nResponda **somente** com base nos documentos acima."
    ]
    return "\n\n".join(blocos).strip()

def formatar_instrucao_em_lista(conteudo: str) -> str:
    """
    Formata conteúdo textual em passos numerados, suportando:
    - Números: 1. passo
    - Asteriscos: * passo
    - Hífens: - passo
    """
    # Primeiro tenta detetar passos numerados
    passos = re.split(r"(?:^|\n)\s*\d+\.\s+", conteudo)
    if len(passos) <= 1:
        # Se não houver vários passos numerados, tenta asteriscos ou hífens
        passos = re.split(r"(?:^|\n)\s*[\*\-]\s+", conteudo)
        passos = [p.strip() for p in passos if p.strip()]
        if len(passos) <= 1:
            # Se ainda não houver vários passos, devolve original
            return conteudo

    resultado_formatado = "Instruções passo a passo:"
    for i, passo in enumerate(passos, 1):
        resultado_formatado += f"Passo {i}: {passo}"

    return resultado_formatado


async def generate_rag_response(
    user_query: str,
    db: DBSession,
    current_user: Users,
    tema: str,
    modo: str = "exploratório",
    papel: str = "Agente",
    tema_inferido_auto: bool = False
) -> str:
    print("Modo recebido:", modo)
    print("PAPEL: ", papel)
    print("TEMA", tema)
    print("INFERDIO: ", tema_inferido_auto)
    linguagem_detectada = detectar_idioma(user_query)

    # Recuperação
    collection = get_chroma_collection()

    if tema_inferido_auto:
        results = collection.query(query_texts=[user_query], n_results=12, include=["documents", "distances"],)
    else:
        results = query_prioritaria_por_source(collection, user_query=user_query, tema=tema, n_results=12, limiar_distancia=0.1)

    retrieved_docs = results.get("documents", [[]])[0] if results else []

    if not retrieved_docs:
        return "Não sei. Não foram encontrados documentos relevantes."

    documentos = preparar_documentos_para_prompt(retrieved_docs, max_docs=8, max_chars=1500)

    # Modelo definido nas configurações globais
    settings = get_global_settings(db)
    modelo = (settings.modelo if settings and getattr(settings, "modelo", None) else "mistral").lower()
    url = OLLAMA_URL if modelo in ["mistral", "llama3"] else GEMINI_URL

    # Estilo com base na linguagem do utilizador
    linguagem = getattr(current_user, "ling_preferida", "Formal") or "Formal"
    funcao = getattr(current_user, "funcao", "Operador") or "Operador"
    experiencia = getattr(current_user, "experiencia", "Intermédio") or "Intermédio"

    if linguagem == "Informal":
        estilo_base = (
            "Usa um tom informal e descontraído, como se estivesses a conversar com um colega. "
            "Simplifica termos técnicos, evita jargões e escreve de forma direta."
        )
    else:
        estilo_base = (
            "Usa um tom formal, profissional e técnico. Evita expressões coloquiais. "
            "Utiliza vocabulário preciso, frases completas e estrutura clara."
        )

    system_prompt = construir_system_prompt(estilo_base, linguagem, linguagem_detectada, documentos, user_query, papel, modo)

    if funcao == 3:
        if experiencia == 1:
            system_prompt += "Adapta a explicação para alguém com pouca experiência técnica. Inclui passos detalhados e linguagem acessível."
        elif experiencia == 3:
            system_prompt += "Responde de forma direta e técnica, omitindo explicações básicas."
        else:
            system_prompt += "Mantém um equilíbrio entre explicação e concisão."

    elif funcao == 7:
        if experiencia == 1:
            system_prompt += "Usa linguagem simples e clara. Evita jargões técnicos sempre que possível"
        elif experiencia == 3:
            system_prompt += "Responde de forma objetiva, assumindo conhecimento prévio."
        else:
            system_prompt += "Explica com clareza, mas sem exagerar nos detalhes."

    else:  # Operador ou outro
        system_prompt += "Adapta a explicação consoante a experiência do utilizador indicada acima."

    if modelo in ["mistral", "llama3"]:
        user_message = f"{user_query.strip()}\n\n--- DOCUMENTOS DISPONÍVEIS ---\n"
        for i, doc in enumerate(documentos, 1):
            user_message += f"[Documento {i}]: {doc}\n"
        user_message += (
            "\nResponde **somente** com base nos documentos acima. "
            "Se a informação não estiver nos documentos, responde exatamente: "
            "'Essa informação não está disponível nos documentos fornecidos.'"
        )

    resposta = ""

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            if modelo in ["mistral", "llama3"]:
                # Streaming com Ollama (JSON lines)
                payload = {
                    "model": modelo,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0,
                    "stream": True,
                }
                async with client.stream("POST", url, json=payload) as r:
                    r.raise_for_status()
                    async for line in r.aiter_lines():
                        if not line:
                            continue
                        # Ollama envia JSON por linha
                        try:
                            data = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        msg = data.get("message", {})
                        if isinstance(msg, dict):
                            chunk = msg.get("content")
                            if chunk:
                                resposta += chunk
                        # Quando done True, termina
                        if data.get("done") is True:
                            break

            elif modelo == "gemini":
                headers = {"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY}
                model_request = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": system_prompt}],
                        }
                    ]
                }
                resp = await client.post(url, headers=headers, json=model_request)
                resp.raise_for_status()
                data = resp.json()
                # Extrai texto com tolerância a formatos
                resposta = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                ).strip()

    except httpx.HTTPStatusError as e:
        #return f"Falha HTTP do modelo: {e}"
        return "Não foi possível gerar a resposta no momento. Por favor, tente novamente mais tarde."
    except Exception as e:
        #return f"Não foi possível gerar resposta. Erro: {e}"
        return "Ocorreu um erro ao gerar a resposta. Por favor, tente novamente."

    if papel == "Tutor" and modo == "instrucional":
        resposta = formatar_instrucao_em_lista(resposta)

    return resposta.strip() if resposta else "Não foi possível gerar resposta."



async def gerar_quiz_gemini(tema: str, idioma: str) -> dict:
    idioma_prompt = "português" if idioma == "pt" else "inglês"
    prompt = f"""
Gera um quiz com perguntas de múltipla escolha sobre o tema: {tema}.
Todo o quiz deve estar em {idioma_prompt}.
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
Responde apenas com JSON **puro** (sem markdown, sem explicações). Se as perguntas no chat estiverem em inglês faz o quiz em inglês.
"""

    headers = {"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY}

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            GEMINI_URL,
            headers=headers,
            json={
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ]
            },
        )
        data = resp.json()

        try:
            raw = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            if not raw or not raw.strip():
                raise ValueError("Resposta vazia recebida do Gemini.")

            limpa = limpar_json_markdown(raw)
            return json.loads(limpa)
        except Exception as e:
            # Log opcional: print(data)
            raise ValueError(f"Não foi possível gerar quiz com Gemini: {e}")


async def gerar_quiz_ollama(tema: str, idioma: str) -> dict:
    idioma_prompt = "português" if idioma == "pt" else "inglês"
    prompt = f"""
      Gera um quiz com perguntas de múltipla escolha sobre o tema: {tema}.
      Todo o quiz deve estar em {idioma_prompt}.
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


async def gerar_quiz_com_rag(tema: str, modelo: str = "gemini", idioma: str = "pt") -> dict:
    if modelo == "gemini":
        return await gerar_quiz_gemini(tema, idioma)
    elif modelo == "mistral":
        return await gerar_quiz_ollama(tema, idioma)
    else:
        raise ValueError(f"Modelo desconhecido: {modelo}")