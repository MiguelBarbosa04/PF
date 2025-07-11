import React, {useEffect, useState} from "react";
import "../assets/css/ChatOptionsMenu.css";
import TokenInfo from "./TokenInfo.jsx";
import {getSessionsByUser} from "../services/api.js";
import {FaEdit, FaQuestionCircle, FaTrash} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const ChatOptionsMenu = ({session, userData, onSessionUpdated, onDelete}) => {
    const navigate = useNavigate();

  const handleEdit = async () => {
    const novoTema = prompt("Novo nome para a sessão:", session.tema || "");
    if (!novoTema || novoTema === session.tema) return;

    try {
      await updateSession(session.id, { tema: novoTema });
      if (onSessionUpdated) {
        onSessionUpdated(session.id, novoTema);
      }
    } catch (error) {
      console.error("Erro ao editar sessão:", error);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Tens a certeza que queres eliminar esta sessão?")) {
      if (onDelete) onDelete(session.id);
    }
  };

  const handleQuiz = () => {
    navigate(`/quiz/${session.id}`);
  };

  return (
    <div className="chat-options-menu">
      <button onClick={handleEdit}><FaEdit /> Editar</button>
      <button onClick={handleDelete}><FaTrash /> Eliminar</button>
      {userData?.funcao === "tutor" && (
        <button onClick={handleQuiz}><FaQuestionCircle /> Quiz</button>
      )}
    </div>
  );
};

export default ChatOptionsMenu;