import React, { forwardRef } from "react";
import "../assets/css/ChatOptionsMenu.css";
import { FaEdit, FaQuestionCircle, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router";
import { updateSession } from "../services/api.js";

const ChatOptionsMenu = forwardRef(({ session, userData, onSessionUpdated, onDelete }, ref) => {
  const navigate = useNavigate();
  const TUTOR_AI = "Tutor";
  const papelAtual = localStorage.getItem("papel");

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
    <div className="chat-options-menu" ref={ref}>
      <button onClick={handleEdit}><FaEdit /> Editar</button>
      <button onClick={handleDelete}><FaTrash /> Eliminar</button>
      {papelAtual === TUTOR_AI && (
        <button onClick={handleQuiz}><FaQuestionCircle /> Quiz</button>
      )}
    </div>
  );
});

export default ChatOptionsMenu;
