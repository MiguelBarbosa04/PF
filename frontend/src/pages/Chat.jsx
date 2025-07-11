import React, { useEffect, useState, useRef } from 'react';
import { getCurrentUser, sendMessage, getMessagesBySession, rateMessage } from '../services/api.js';
import '../assets/css/Chat.css';

const Chat = () => {

  const tema = localStorage.getItem("tema") || "Nenhum tema escolhido";
  const papel = localStorage.getItem("papel") || "Papel não definido";

  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionId = parseInt(localStorage.getItem('sessionId'), 10);
  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID ausente. Redirecionar...");
      return;
    }

    fetchMensagens();
  }, [sessionId]);

  const fetchMensagens = async () => {
    try {
      const msgs = await getMessagesBySession(sessionId);
      setMensagens(msgs);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const handleEnviar = async () => {
    if (!input.trim()) return;

    const novaMensagem = {
      session_id: sessionId,
      conteudo: input,
      tipo: "texto",
      remetente: "user",
      criado_em: new Date().toISOString(),
    };

    setMensagens([...mensagens, { ...novaMensagem, id: Date.now() }]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(novaMensagem);
      const botMsg = {
        session_id: sessionId,
        conteudo: response.resposta,
        tipo: "texto",
        remetente: "bot",
        criado_em: new Date().toISOString(),
        id: Date.now() + 1,
      };

      setMensagens((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvaliacao = async (msgId, valor) => {
    try {
      await rateMessage(msgId, valor);
      const atualizadas = mensagens.map((msg) =>
        msg.id === msgId ? { ...msg, avaliacao: valor } : msg
      );
      setMensagens(atualizadas);
    } catch (error) {
      console.error("Erro ao avaliar mensagem:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  return (
    <div className="chat-container">
      <div className="chat-header">Chat com {localStorage.getItem("papel")}</div>
<p><strong>Tema escolhido:</strong> {tema}</p>
    <p><strong>Papel escolhido:</strong> {papel}</p>
      <div className="chat-body">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.remetente === 'user' ? 'user' : 'bot'}`}
          >
            <div className="conteudo">{msg.conteudo}</div>
            {msg.remetente === "bot" && (
              <div className="avaliacao">
                Avaliação:
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`estrela ${msg.avaliacao === star ? 'ativa' : ''}`}
                    onClick={() => handleAvaliacao(msg.id, star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleEnviar} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
