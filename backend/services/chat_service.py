import json
from typing import Optional, Tuple

from backend.repositories.global_settings import get_global_settings
from backend.schemas.sessions import SessionCreate
from backend.repositories.sessions import create_session
from sqlalchemy.orm import Session as DBSession
from backend.schemas.messages import ChatRequest
from backend.database.models import Messages
from datetime import datetime
import httpx
import re
from langchain.vectorstores import Chroma
from langchain.embeddings import OllamaEmbeddings
from backend.services.rag_service import generate_rag_response



def limpar_tema(texto: str) -> str:
    texto = texto.strip()
    texto = texto.strip('"\'')  # Remove aspas simples ou duplas do início/fim
    texto = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', texto)  # Adiciona espaço entre palavras coladas tipo "MatemáticaBásica"
    return texto

async def inferir_tema_com_llm(conteudo: str, db: DBSession) -> str:
    prompt = f"""
A seguinte mensagem faz parte de uma conversa entre um utilizador e um assistente.

Mensagem: "{conteudo}"

Resume esta mensagem num único tema ou título com 2-4 palavras (por exemplo: 'Energia Cinética', 'Contabilidade Financeira', etc.). Apenas devolve o tema, sem explicações.
"""

    # Obter modelo atual
    settings = get_global_settings(db)
    modelo = settings.modelo if settings else "mistral"

    url = (
        "http://localhost:11434/api/chat"
        if modelo in ["mistral", "llama3"]
        else "https://generativeai.googleapis.com/v1beta/models/gemini-pro:generateContent"
    )

    API_KEY = "12345"
    resposta = ""
    async with httpx.AsyncClient(timeout=30) as client:
        if modelo in ["mistral", "llama3"]:
            request_data = {
                "model": modelo,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = await client.post(url, json=request_data)
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        data = json.loads(line)
                        content = data.json().get("message", {}).get("content")
                        if content:
                            resposta += content.strip()
                    except Exception:
                        continue
        elif modelo == "gemini":
            request_data = {
                "contents": [{"parts": [{"text": prompt}], "role": "user"}]
            }
            response = await client.post(url, params={"key": API_KEY}, json=request_data)
            if response.status_code == 200:
                data = response.json()
                parts = data.get("candidates", [])[0].get("content", {}).get("parts", [])
                if parts:
                    resposta = parts[0].get("text", "").strip()

    return limpar_tema(resposta.strip()) or "Tema Desconhecido"


# async def generate_chat_response(db: DBSession, request: ChatRequest) -> str:
async def generate_chat_response(db: DBSession, request: ChatRequest,
                                     user_id: Optional[int] = None,
                                     papel: Optional[str] = None
                                     ) -> Tuple[Messages, int]:
    nova_session = request.session_id

    # Criar nova sessão se não tiver session_id
    if not request.session_id:
        if not user_id or not papel:
            raise ValueError("user_id e papel são obrigatórios se não houver session_id")

        # Gerar tema a partir da pergunta
        tema_inferido = await inferir_tema_com_llm(request.conteudo, db)

        nova_sessao = SessionCreate(
            user_id=user_id,
            papel=papel,
            tema=tema_inferido,
            inicio=request.criado_em
        )
        session_obj = create_session(db, nova_sessao)
        request.session_id = session_obj.id
        nova_session = session_obj.id
    else:
        nova_session = request.session_id

    # Guardar mensagem do utilizador
    nova_msg = Messages(
        session_id=request.session_id,
        conteudo=request.conteudo,
        tipo=request.tipo,
        remetente=request.remetente,
        criado_em=request.criado_em,
        avaliacao=request.avaliacao,
        modelo=""
    )
    db.add(nova_msg)
    db.commit()
    db.refresh(nova_msg)

    # Se for o utilizador, gerar resposta com RAG
    if request.remetente == "user":
        resposta = await generate_rag_response(request.conteudo, db)

        # Obter o modelo usado para gravar na BD
        settings = get_global_settings(db)
        modelo_usado = settings.modelo if settings else "mistral"

        bot_msg = Messages(
            session_id=request.session_id,
            conteudo=resposta,
            tipo=request.tipo,
            remetente="bot",
            criado_em=datetime.utcnow(),
            modelo=modelo_usado
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(bot_msg)

        return bot_msg, nova_session

    return nova_msg, nova_session