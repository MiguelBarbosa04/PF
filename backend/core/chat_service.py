import os
import httpx
from sqlalchemy.orm import Session
from backend.repositories.chat_repository import get_or_create_session, save_message

async def generate_chat_response(db: Session, user_id: int, user_message: str) -> str:
    # 1. Obtém ou cria sessão
    session = get_or_create_session(db, user_id)

    # 2. Guarda mensagem do utilizador
    save_message(db, session.id, "user", user_message)

    # 3. Chamada à API da LLM (OpenAI)
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY não definida no ambiente!")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "És um tutor educativo."},
            {"role": "user", "content": user_message}
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data
        )
        result = response.json()

    ai_response = result["choices"][0]["message"]["content"]

    # 4. Guarda resposta da IA
    save_message(db, session.id, "ai", ai_response)

    return ai_response
