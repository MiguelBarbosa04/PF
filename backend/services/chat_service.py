from typing import Optional

from backend.database.models import Session as DBSessionModel
from backend.schemas.sessions import SessionCreate
from backend.repositories.sessions import create_session
from sqlalchemy.orm import Session as DBSession
from fastapi import Depends
from sqlalchemy.orm import Session
from backend.schemas.messages import ChatRequest
from backend.database.models import Messages
from datetime import datetime
import httpx

async def inferir_tema_com_llm(conteudo: str) -> str:
    prompt = f"""
A seguinte mensagem faz parte de uma conversa entre um utilizador e um assistente.

Mensagem: "{conteudo}"

Resume esta mensagem num único tema ou título com 2-4 palavras (por exemplo: 'Energia Cinética', 'Contabilidade Financeira', etc.). Apenas devolve o tema, sem explicações.
"""

    mistral_request = {
        "model": "mistral",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    resposta = ""
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post("http://localhost:11434/api/chat", json=mistral_request)
        response.raise_for_status()
        async for line in response.aiter_lines():
            if line.strip():
                try:
                    data = httpx.Response(200, content=line)
                    content = data.json().get("message", {}).get("content")
                    if content:
                        resposta += content.strip()
                except Exception:
                    continue

    return resposta.strip() or "Tema Desconhecido"

async def generate_chat_response(db: Session, request: ChatRequest, user_id: int, papel: Optional[str]) -> tuple[Messages, int]:
    nova_session = None

    # Criar nova sessão se não tiver session_id
    if not request.session_id:
        if not user_id or not papel:
            raise ValueError("user_id e papel são obrigatórios se não houver session_id")

        #Gerar tema a partir da pergunta
        tema_inferido = await inferir_tema_com_llm(request.conteudo)

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
        avaliacao=request.avaliacao
    )
    db.add(nova_msg)
    db.commit()
    db.refresh(nova_msg)

    # Se for o utilizador, gerar resposta
    if request.remetente == "user":
        resposta = ""
        mistral_request = {
            "model": "mistral",
            "messages": [
                {"role": "user", "content": request.conteudo}
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post("http://localhost:11434/api/chat", json=mistral_request, timeout=None)

            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        data = httpx.Response(200, content=line)
                        content = data.json().get("message", {}).get("content")
                        if content:
                            resposta += content
                    except Exception:
                        continue

        # Guardar resposta do bot
        bot_msg = Messages(
            session_id=request.session_id,
            conteudo=resposta,
            tipo=request.tipo,
            remetente="bot",
            criado_em=datetime.utcnow()
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(bot_msg)

        return bot_msg, nova_session

    return nova_msg, nova_session
