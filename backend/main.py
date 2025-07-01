from fastapi import FastAPI
from backend.api.routes import users
from backend.database.db import Base, engine

# Cria as tabelas na bd
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Inclui rotas
app.include_router(users.router)

