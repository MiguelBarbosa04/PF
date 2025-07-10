from fastapi import FastAPI
from backend.api.routes import users, sessions, messages, chat_router
from backend.database.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


load_dotenv()


# Cria as tabelas na bd
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",  # origem do frontend (Vite)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(users.router)
app.include_router(chat_router.router)
app.include_router(sessions.router)
app.include_router(messages.router)