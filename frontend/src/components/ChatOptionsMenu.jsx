import React, { forwardRef } from "react";
import "../assets/css/ChatOptionsMenu.css";
import { FaEdit, FaQuestionCircle, FaTrash } from "react-icons/fa";
import { updateSession } from "../services/api.js";
import {useLanguage} from "../locales/LanguageContext.jsx";

const ChatOptionsMenu = forwardRef(({ session, userData, onSessionUpdated, onDelete, onQuizRequested }, ref) => {
  const TUTOR_AI = "Tutor";
  const papelAtual = localStorage.getItem("papel");
  const { t } = useLanguage();

  const handleEdit = async () => {
    const novoTema = prompt(t("chatOptions-prompt"), session.tema || "");
    if (!novoTema || novoTema === session.tema) return;

    try {
      await updateSession(session.id, { tema: novoTema });
      if (onSessionUpdated) {
        onSessionUpdated(session.id, novoTema);
      }
    } catch (error) {
      console.error(t("chatOptions-error-edit"), error);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t("chatOptions-confirm-delete"))) {
      if (onDelete) onDelete(session.id);
    }
  };


const handleQuiz = async () => {
  if (onQuizRequested) {
    onQuizRequested(session.id);
  }
};



  return (
    <div className="chat-options-menu" ref={ref}>
      <button onClick={handleEdit}><FaEdit /> {t("chat-otions-edit")}</button>
      <button onClick={handleDelete}><FaTrash /> {t("chat-otions-delete")}</button>
      {papelAtual === TUTOR_AI && (
      <button onClick={()=>handleQuiz()}><FaQuestionCircle /> {t("chat-otions-quiz")}</button>
    )}

    </div>
  );
});

export default ChatOptionsMenu;
