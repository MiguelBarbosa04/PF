import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import Sidebar from "../components/Sidebar";
import ChatMessage from "./ChatMessage.jsx";
import {
  getMessagesBySession, getSessionById,
  rateMessage,
  sendMessage,
} from "../services/api.js";
import "../assets/css/ChatForm.css";
import { FaArrowCircleRight, FaMicrophone } from "react-icons/fa";
import { useAzureSpeechRecognition } from "../hooks/useAzureSpeechRecognition.js";
import {useLanguage} from "../locales/LanguageContext.jsx";

const ChatForm = ({ modo, setModo, onQuizRequested }) => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const navigate = useNavigate();
  const [refreshSidebar, setRefreshSidebar] = useState(false);
  const location = useLocation();
  const papelSelecionado = localStorage.getItem("papel");
  const chatContainerRef = useRef(null);
  const stopFnsRef = useRef([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState(null);
  const [ttsProvider, setTtsProvider] = useState(localStorage.getItem("ttsProvider") || "azure");
  const { t } = useLanguage();
  const [sessaoAtual, setSessaoAtual] = useState(null);
  const { startListening, stopListening, isListening } = useAzureSpeechRecognition({
    azureKey: import.meta.env.VITE_AZURE_SPEECH_KEY,
    azureRegion: import.meta.env.VITE_AZURE_SPEECH_REGION,
    onResult: (text) => { setInput(text); setIsVoiceInput(true); },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const local = localStorage.getItem("ttsProvider");
      if (local !== ttsProvider) setTtsProvider(local);
    }, 500);
    return () => clearInterval(interval);
  }, [ttsProvider]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionId) return setMessages([]);
      const msgs = await getMessagesBySession(sessionId);
      setMessages(msgs);
    };
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    const fetchSessaoAtual = async () => {
      if (!sessionId) {
        setSessaoAtual(null);
        return;
      }

      try {
        const sessao = await getSessionById(sessionId);
        setSessaoAtual(sessao);
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
      }
    };

    fetchSessaoAtual();
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
      tema: sessaoAtual?.tema || null,
      papel: papelSelecionado,
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
        autoSpeak: isVoiceInput,
      };

      setMessages((prev) => [...prev, novaMensagemBot]);
      if (isVoiceInput) {
        setLastSpokenMessageId(resposta.id);
      }

      if (!sessionId && resposta.session_id) {
        stopAll();
        navigate(`/chat/${resposta.session_id}`);
      }
      setRefreshSidebar((prev) => !prev);
      setIsVoiceInput(false);
    } catch (error) {
      console.error(t("chatForm-error-message"), error);
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

  const addStopFn = (stopFn) => {
    if (typeof stopFn === "function" && !stopFnsRef.current.includes(stopFn)) {
      stopFnsRef.current.push(stopFn);
    }
  };

  const stopAll = () => {
    stopFnsRef.current.forEach((stopFn) => stopFn());
    stopFnsRef.current = [];
  };

  useEffect(() => {
    stopAll();
    setLastSpokenMessageId(null);
  }, [sessionId]);

  return (
    <div className="chat-wrapper">
      <Sidebar modo={modo} setModo={setModo} key={sessionId || "default"}
               refreshTrigger={refreshSidebar} onQuizRequested={onQuizRequested} />
      <div className="chat-main">
        {messages.length === 0 ? (
          <h2 className="chat-welcome">{t("chat-welcome")}</h2>
        ) : (
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} onRate={handleAvaliarMensagem} stopAll={stopAll} addStopFn={addStopFn}
                isVoiceInput={msg.remetente === "bot" && msg.id === lastSpokenMessageId} ttsProvider={ttsProvider} />
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
            placeholder={t("chat-input-placeholder")}
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
            <button
              className="chat-voice-button"
              onClick={() => {
                isListening ? stopListening() : startListening();
              }}
            >
              {isListening ? (t("chat-voice-btn")) : <FaMicrophone />}
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
