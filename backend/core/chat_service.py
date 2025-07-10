from backend.schemas.messages import ChatRequest
from backend.database.models import Messages
from sqlalchemy.orm import Session as DBSession
from datetime import datetime
import httpx

async def generate_chat_response(db: DBSession, request: ChatRequest) -> str:
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

    # Enviar para Mistral (apenas se for remetente user)
    resposta = ""
    if request.remetente == "user":
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

    return resposta if resposta else "Mensagem registada."
