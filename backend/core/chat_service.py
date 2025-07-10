import httpx
from sqlalchemy.orm import Session
from backend.repositories.chat_repository import get_or_create_session, save_message

async def generate_chat_response(db: Session, user_id: int, user_message: str) -> str:
    session = get_or_create_session(db, user_id)
    save_message(db, session.id, "user", user_message)

    payload = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": "És um tutor educativo."},
            {"role": "user", "content": user_message}
        ],
        "stream": True  # ativa streaming
    }

    resposta_final = ""

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", "http://localhost:11434/api/chat", json=payload) as response:
            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        chunk = response.json() if isinstance(response, dict) else httpx.Response.json(response)
                    except:
                        import json
                        chunk = json.loads(line)
                    if "message" in chunk and "content" in chunk["message"]:
                        resposta_final += chunk["message"]["content"]

    save_message(db, session.id, "ai", resposta_final)
    return resposta_final
