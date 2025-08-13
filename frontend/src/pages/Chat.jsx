import React, { useState } from 'react';
import ChatForm from '../components/ChatForm.jsx';
import Modal from 'react-modal';
import QuizPage from './QuizPage.jsx';
import axios from 'axios';
import {FaRegTimesCircle} from "react-icons/fa";
import {useLanguage} from "../locales/LanguageContext.jsx";

Modal.setAppElement('#root'); // garante acessibilidade

const Chat = () => {
  const [modo, setModo] = useState("exploratório");
  const [quizSessionId, setQuizSessionId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { t, lang } = useLanguage();

  const abrirQuizModal = async (sessionId) => {
    try {
      const response = await axios.post("http://localhost:8000/quizzes/gerar_quiz", {
        session_id: sessionId,
        lang
      });
      setQuizSessionId(response.data.session_id);
      setModalAberto(true);
      console.log("LINGAUGERMEMMEMEMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE: ", response);
    } catch (error) {
      console.error(t("chatPage-error-quiz"), error);
      alert(t("chatPage-error-create-quiz"));
    }
  };

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <ChatForm modo={modo} setModo={setModo} onQuizRequested={abrirQuizModal} />

      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        contentLabel="Quiz Modal"
        style={{
          content: {
            width: '90%',
            height: '90%',
            margin: 'auto',
            borderRadius: '10px',
            overflow: 'auto',
          }
        }}
      >

        <button style={{
    position: "absolute",
    width: "5rem",
    background : "none",
    top: "10px",
    right: "10px",
    color: "white",
    border: "none",
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "4px",
    cursor: "pointer"
  }} onClick={() => setModalAberto(false)}> <FaRegTimesCircle style={{fontSize: "2rem", color : "black"}}/></button>
        {quizSessionId && <QuizPage sessionId={quizSessionId} />}
      </Modal>
    </div>
  );
};

export default Chat;
