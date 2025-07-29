from backend.api.routes import users, sessions, messages, rag, upload, inspect, global_settings, feedback, tts
from backend.database.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

# Cria as tabelas na bd
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",  # origem do frontend (Vite)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(messages.router)
app.include_router(rag.router)
app.include_router(upload.router)
app.include_router(inspect.router)
app.include_router(global_settings.router)
app.include_router(feedback.router)

app.include_router(tts.router)