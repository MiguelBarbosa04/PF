from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from backend.database.db import Base

class Experiencia(Base):
    __tablename__ = "experiencia"

    id = Column(Integer, primary_key=True)
    descricao = Column(String(30), nullable=False)

class Funcao(Base):
    __tablename__ = "funcao"

    id = Column(Integer, primary_key=True)
    nome = Column(String(30), nullable=False)

class Linguagem(Base):
    __tablename__ = "linguagem"

    id = Column(Integer, primary_key=True)
    nome = Column(String(30), nullable=False)

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    nome = Column(String(20), nullable=False)
    email = Column(String(40), nullable=False)
    experiencia = Column(Integer, ForeignKey("experiencia.id"))
    funcao = Column(Integer, ForeignKey("funcao.id"))
    ling_preferida = Column(Integer, ForeignKey("linguagem.id"))
    pin = Column(Integer, nullable=False)

    # Relacionamentos (usando o nome correto da classe e __tablename__)
    experiencia_rel = relationship("Experiencia", backref="users")
    funcao_rel = relationship("Funcao", backref="users")
    linguagem_rel = relationship("Linguagem", backref="users")
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    inicio = Column(DateTime, default=datetime.utcnow)

    user = relationship("Users", back_populates="sessions")
    messages = relationship("Messages", back_populates="session")

class Messages(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    conteudo = Column(String(1000), nullable=False)
    remetente = Column(String(10), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    avaliacao = Column(Integer, nullable=True)

    session = relationship("Session", back_populates="messages")
