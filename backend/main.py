from fastapi import FastAPI
from backend.api.routes import users
from backend.database.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware

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