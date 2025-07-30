import React, { useState } from 'react';
import ChatForm from '../components/ChatForm.jsx';
import Modal from 'react-modal';
import QuizPage from './QuizPage.jsx';
import axios from 'axios';

Modal.setAppElement('#root'); // garante acessibilidade

const Chat = () => {
  const [modo, setModo] = useState("exploratório");

  const [quizSessionId, setQuizSessionId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const abrirQuizModal = async (sessionId) => {
    try {
      const response = await axios.post("http://localhost:8000/quizzes/gerar_quiz", {
        session_id: sessionId
      });
      setQuizSessionId(response.data.session_id);
      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao gerar quiz:", error);
      alert("Erro ao criar quiz. Tenta novamente.");
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
        <button onClick={() => setModalAberto(false)}>Fechar</button>
        {quizSessionId && <QuizPage sessionId={quizSessionId} />}
      </Modal>
    </div>
  );
};

export default Chat;
