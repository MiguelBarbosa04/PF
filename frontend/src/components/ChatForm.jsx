import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import Sidebar from "../components/Sidebar";
import ChatMessage from "./ChatMessage.jsx";
import {
  getMessagesBySession,
  rateMessage,
  sendMessage,
} from "../services/api.js";
import "../assets/css/ChatForm.css";
import { FaArrowCircleRight, FaMicrophone } from "react-icons/fa";
import useVoiceRecognition from "../hooks/useVoiceRecognition.js";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis.js";

const ChatForm = ({ modo, setModo }) => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const navigate = useNavigate();
  const [refreshSidebar, setRefreshSidebar] = useState(false);
  const location = useLocation();
  const papelSelecionado = localStorage.getItem("papel");
  const chatContainerRef = useRef(null);
  const { isListening, toggleListening, isVoiceMessage } = useVoiceRecognition(setInput);
  const { speak, stop } = useSpeechSynthesis();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionId) return setMessages([]);
      const msgs = await getMessagesBySession(sessionId);
      setMessages(msgs);
    };
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, [location.pathname]);

  const handleEnviarMensagem = async () => {
    if (!input.trim()) return;

    const novaMensagemUser = {
      session_id: sessionId ? Number(sessionId) : null,
      conteudo: input,
      tipo: "texto",
      remetente: "user",
      criado_em: new Date().toISOString(),
      avaliacao: null,
      modo,
      papel: !sessionId ? papelSelecionado : undefined,
    };

    setMessages((prev) => [...prev, novaMensagemUser]);
    setInput("");

    try {
      setIsBotTyping(true);
      const resposta = await sendMessage(novaMensagemUser);
      setIsBotTyping(false);

      const novaMensagemBot = {
        id: resposta.id,
        conteudo: resposta.resposta,
        tipo: "texto",
        remetente: "bot",
        criado_em: new Date().toISOString(),
        avaliacao: null,
        modelo: resposta.modelo,
      };

      setMessages((prev) => [...prev, novaMensagemBot]);
      if (isVoiceMessage.current) speak(novaMensagemBot.conteudo);
      isVoiceMessage.current = false;

      if (!sessionId && resposta.session_id) {
        navigate(`/chat/${resposta.session_id}`);
      }

      setRefreshSidebar((prev) => !prev);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert(error.message);
    }
  };

  const handleAvaliarMensagem = async (msgId, nota) => {
    await rateMessage(msgId, nota);
    setMessages((msgs) =>
      msgs.map((m) => (m.id === msgId ? { ...m, avaliacao: nota } : m))
    );
  };

  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [messages]);

  return (
    <div className="chat-wrapper">
      <Sidebar modo={modo} setModo={setModo} key={sessionId || "default"} refreshTrigger={refreshSidebar} />
      <div className="chat-main">
        {messages.length === 0 ? (
          <h2 className="chat-welcome">No que posso ajudar?</h2>
        ) : (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} onRate={handleAvaliarMensagem} onSpeak={speak} onStop={stop} />
            ))}
            {isBotTyping && (
              <div className="chat-message bot typing-indicator">
                <span>...</span>
              </div>
            )}
          </div>
        )}
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Digite a sua pergunta/dúvida"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            maxLength={2000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleEnviarMensagem();
              }
            }}
          />
          <div className="chat-btns">
            <button className="chat-voice-button" onClick={toggleListening}>
              {isListening ? "A ouvir..." : <FaMicrophone />}
            </button>
            <button className="chat-send-button" onClick={handleEnviarMensagem}>
              <FaArrowCircleRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatForm;