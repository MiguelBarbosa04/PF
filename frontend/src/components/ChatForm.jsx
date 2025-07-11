import React from "react";
import Sidebar from "../components/Sidebar";
import "../assets/css/ChatForm.css";

const ChatForm = () => {
  return (
    <div className="chat-wrapper">
      <Sidebar />
      <div className="chat-main">
        <h2 className="chat-welcome">No que posso ajudar?</h2>
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Digite a sua pergunta/dúvida"
          />
          <button className="chat-send-button">➤</button>
        </div>
      </div>
    </div>
  );
};

export default ChatForm;