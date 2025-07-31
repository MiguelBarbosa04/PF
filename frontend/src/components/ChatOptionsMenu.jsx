import React, { forwardRef } from "react";
import "../assets/css/ChatOptionsMenu.css";
import { FaEdit, FaQuestionCircle, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { updateSession } from "../services/api.js";
import axios from "axios";

const ChatOptionsMenu = forwardRef(({ session, userData, onSessionUpdated, onDelete, onQuizRequested }, ref) => {
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

// const handleQuiz = async () => {
//   try {
//     const response = await axios.post("http://localhost:8000/quizzes/gerar_quiz", {
//       session_id: session.id
//     });
//
//     navigate(`/quizzes/session/quiz/${response.data.session_id}`);
//   } catch (error) {
//     console.error("Erro ao gerar quiz:", error);
//     alert("Erro ao criar quiz. Tenta novamente.");
//   }
// };

const handleQuiz = async () => {
  if (onQuizRequested) {
    onQuizRequested(session.id);
  }
};



  return (
    <div className="chat-options-menu" ref={ref}>
      <button onClick={handleEdit}><FaEdit /> Editar</button>
      <button onClick={handleDelete}><FaTrash /> Eliminar</button>
      {papelAtual === TUTOR_AI && (
      <button onClick={()=>handleQuiz()}><FaQuestionCircle /> Quiz</button>
    )}

    </div>
  );
});

export default ChatOptionsMenu;
