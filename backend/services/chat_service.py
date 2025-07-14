from backend.database.models import Session as DBSessionModel
from backend.schemas.sessions import SessionCreate
from backend.repositories.sessions import create_session
from sqlalchemy.orm import Session as DBSession
from backend.schemas.messages import ChatRequest
from backend.database.models import Messages
from datetime import datetime
import httpx
from langchain.vectorstores import Chroma
from langchain.embeddings import OllamaEmbeddings

async def generate_chat_response(db: DBSession, request: ChatRequest) -> str:
    # Criar nova sessão se não tiver session_id
    if not request.session_id:
        if not request.user_id or not request.papel:
            raise ValueError("user_id e papel são obrigatórios se não houver session_id")

        # Gerar tema a partir da pergunta
        tema_inferido = await inferir_tema_com_llm(request.conteudo)

        nova_sessao = SessionCreate(
            user_id=request.user_id,
            papel=request.papel,
            tema=tema_inferido,
            inicio=request.criado_em
        )
        session_obj = create_session(db, nova_sessao)
        request.session_id = session_obj.id

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

    # Se for o utilizador, gerar resposta com RAG
    resposta = ""
    if request.remetente == "user":
        # Recuperar contexto com ChromaDB
        embeddings = OllamaEmbeddings(model="mistral")
        db_chroma = Chroma(persist_directory="chroma/", embedding_function=embeddings)

        docs = db_chroma.similarity_search(request.conteudo, k=3)
        contexto = "\n\n".join([doc.page_content for doc in docs]) if docs else "Sem contexto relevante encontrado."

        # Construir prompt com contexto
        mensagem = f"""Contexto:
{contexto}

Pergunta: {request.conteudo}

Responde com base apenas no contexto acima.
"""

        mistral_request = {
            "model": "mistral",
            "messages": [
                {"role": "user", "content": mensagem}
            ]
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post("http://localhost:11434/api/chat", json=mistral_request, timeout=None)
            response.raise_for_status()
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
