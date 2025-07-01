from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base


class Experiencia(Base):
    __tablename__ = "Experiencia"

    id = Column(Integer, primary_key=True)
    descricao = Column(String(30), nullable=False)

class Funcao(Base):
    __tablename__ = "Funcao"

    id = Column(Integer, primary_key=True)
    nome = Column(String(30), nullable=False)

class Linguagem(Base):
    __tablename__ = "Linguagem"

    id = Column(Integer, primary_key=True)
    nome = Column(String(30), nullable=False)

class Users(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True)
    nome = Column(String(20), nullable=False)
    email = Column(String(40), nullable=False)
    experiencia = Column(Integer, ForeignKey("Experiencia.id"))
    funcao = Column(Integer, ForeignKey("Funcao.id"))
    ling_preferida = Column(Integer, ForeignKey("Linguagem.id"))
    pin = Column(Integer, nullable=False)

    # Relationships (opcional, se quiser navegar entre tabelas)
    experiencia_rel = relationship("Experiencia")
    funcao_rel = relationship("Funcao")
    linguagem_rel = relationship("Linguagem")
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
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
    avaliacao = Column(Integer)

    session = relationship("Session", back_populates="messages")