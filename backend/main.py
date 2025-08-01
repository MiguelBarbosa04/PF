from backend.api.routes import users_route, sessions_route, messages_route, rag_route, upload_route, inspect_route, \
    global_settings_route, feedback_route, tts_route, quiz_route
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
app.include_router(users_route.router)
app.include_router(sessions_route.router)
app.include_router(messages_route.router)
app.include_router(rag_route.router)
app.include_router(upload_route.router)
app.include_router(inspect_route.router)
app.include_router(global_settings_route.router)
app.include_router(feedback_route.router)
app.include_router(quiz_route.router)
app.include_router(tts_route.router)
