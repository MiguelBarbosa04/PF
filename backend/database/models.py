from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Boolean, Text
from backend.database.db import Base

class Experiencia(Base):
    __tablename__ = "experiencia"

    id = Column(Integer, primary_key=True)
    nome = Column(String(30), nullable=False)

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
    password = Column(String(20), nullable=False)

    # Relacionamentos (usando o nome correto da classe e __tablename__)
    experiencia_rel = relationship("Experiencia", backref="users")
    funcao_rel = relationship("Funcao", backref="users")
    linguagem_rel = relationship("Linguagem", backref="users")
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    papel = Column(String(10), nullable=False)  # 'Agente' ou 'Tutor'
    tema = Column(String(100), nullable=True)
    inicio = Column(TIMESTAMP, nullable=False)

    user = relationship("Users", back_populates="sessions")
    messages = relationship("Messages", back_populates="session", cascade="all, delete-orphan")

class Messages(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    conteudo = Column(String(2000), nullable=False)
    tipo = Column(String(10), nullable=False)  # 'texto' ou 'voz'
    remetente = Column(String(10), nullable=False)  # 'user' ou 'bot'
    criado_em = Column(TIMESTAMP, nullable=False)
    avaliacao = Column(Integer, nullable=True)
    modelo = Column(String(20), nullable=False)

    session = relationship("Session", back_populates="messages")


class GlobalSettings(Base):
    __tablename__ = "global_settings"

    id = Column(Integer, primary_key=True, index=True)
    modelo = Column(String(20), nullable=False)
    atualizado_em = Column(TIMESTAMP, nullable=False)



class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)

    perguntas = relationship("Pergunta", back_populates="quiz", cascade="all, delete")


class Pergunta(Base):
    __tablename__ = "quiz_perguntas"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    enunciado = Column(Text, nullable=False)

    quiz = relationship("Quiz", back_populates="perguntas")
    opcoes = relationship("Opcao", back_populates="pergunta", cascade="all, delete")


class Opcao(Base):
    __tablename__ = "quiz_opcoes"

    id = Column(Integer, primary_key=True, index=True)
    pergunta_id = Column(Integer, ForeignKey("quiz_perguntas.id", ondelete="CASCADE"), nullable=False)
    texto = Column(String(200), nullable=False)
    correta = Column(Boolean, nullable=False)

    pergunta = relationship("Pergunta", back_populates="opcoes")


class RespostaUser(Base):
    __tablename__ = "quiz_respostas_user"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pergunta_id = Column(Integer, ForeignKey("quiz_perguntas.id", ondelete="CASCADE"), nullable=False)
    opcao_id = Column(Integer, ForeignKey("quiz_opcoes.id", ondelete="CASCADE"), nullable=True)  # apenas múltipla escolha
    correta = Column(Boolean, nullable=True)
    respondido_em = Column(TIMESTAMP, nullable=False)