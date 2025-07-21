import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import "../assets/css/ChatForm.css";
import {getMessagesBySession, rateMessage, sendMessage} from "../services/api.js";
import {FaArrowCircleRight} from "react-icons/fa";
import StarsRating from "./StarsRating.jsx";

const ChatForm = () => {
  const { sessionId } = useParams(); // obtém o ID da sessão da URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const navigate = useNavigate();
  const[refreshSidebar, setRefreshSidebar] = useState(false);
  const USER = "user";
  const BOT = "bot";

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionId){
          setMessages([]);
          return;
      }
      try {
        const msgs = await getMessagesBySession(sessionId);
        setMessages(msgs);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      }
    };

    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
      const chatContainer = document.querySelector(".chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
  }, [messages]);

  const papelSelecionado = localStorage.getItem("papel");

  const handleMensagemEnviada = () => {
    setRefreshSidebar(prev => !prev); // alterna o estado para disparar refresh no Sidebar
  };

  const handleEnviarMensagem = async () => {
      if (!input.trim()) return;

      const novaMensagemUser = {
        session_id: sessionId ? Number(sessionId) : null,
        conteudo: input,
        tipo: "texto",
        remetente: USER,
        criado_em: new Date().toISOString(),
        avaliacao: null,
        papel: !sessionId ? papelSelecionado : undefined, // só envia se for nova sessão
      };

      setMessages((prev) => [...prev, novaMensagemUser]);
      setInput("");

      try {
        // Envia para a API
        setIsBotTyping(true);
        const resposta = await sendMessage(novaMensagemUser);
        setIsBotTyping(false);

        if(!sessionId && resposta.session_id){
            // Adiciona a resposta do bot
            const novaMensagemBot = {
              id: resposta.id,
              conteudo: resposta.resposta,
              tipo: "texto",
              remetente: BOT,
              criado_em: new Date().toISOString(),
              avaliacao: null
            };
            setMessages((prev) => [...prev, novaMensagemBot]);
            navigate(`/chat/${resposta.session_id}`)

            handleMensagemEnviada();
        }else{
            // Adiciona a resposta do bot
            const novaMensagemBot = {
              id: resposta.id,
              conteudo: resposta.resposta,
              tipo: "texto",
              remetente: BOT,
              criado_em: new Date().toISOString(),
              avaliacao: null
            };
            setMessages((prev) => [...prev, novaMensagemBot]);

            handleMensagemEnviada();
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }

      setInput(""); // Limpa o campo de input
  };

  const handleAvaliarMensagem = async (msgId, nota) => {
      try {
        await rateMessage(msgId, nota);
        setMessages((msgs) =>
          msgs.map((m) =>
            m.id === msgId ? { ...m, avaliacao: nota } : m
          )
        );
      } catch (error) {
        console.error("Erro ao avaliar mensagem:", error);
      }
  };


  return (
    <div className="chat-wrapper">
      <Sidebar key={sessionId || "default"} refreshTrigger={refreshSidebar}/>
      <div className="chat-main">
        {messages.length === 0 ? (
          <h2 className="chat-welcome">No que posso ajudar?</h2>
        ) : (
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.remetente === USER ? USER : BOT}`}>
                  <div>{msg.conteudo}</div>
                  {msg.remetente === BOT && (
                      <StarsRating avaliacao={msg.avaliacao}
                                   onAvaliar={(nota)=>handleAvaliarMensagem(msg.id, nota)}
                      />
                  )}
              </div>
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
            maxLength={1000}
            onKeyDown={(e)=>{
                if(e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviarMensagem();
                }
            }}
          />
          <button className="chat-send-button" onClick={handleEnviarMensagem}><FaArrowCircleRight/></button>
        </div>
      </div>
    </div>
  );
};

export default ChatForm;