import React, { useEffect, useState } from "react";
import "../assets/css/QuizViewModal.css";

function QuizViewModal({ quizId, onClose }) {
  const [quiz, setQuiz] = useState(null);
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${url}/quizzes/${quizId}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch((err) => console.error("Erro ao carregar quiz:", err));
  }, [quizId]);

  if (!quiz) return null;

  return (
    <div className="modal-view-overlay">
      <div className="modal-view-content">
        <button className="modal-view-close" onClick={onClose}>×</button>

        <div className="quiz-view-header">
          <h2>{quiz.titulo}</h2>
          <p>{quiz.descricao}</p>
        </div>

        <div className="quiz-view-perguntas">
          {quiz.perguntas.map((pergunta, idx) => (
            <div key={pergunta.id} className="quiz-view-pergunta">
              <strong>{idx + 1}. {pergunta.enunciado}</strong>
              <ul className="quiz-view-opcoes">
                {pergunta.opcoes.map((opcao) => (
                  <li key={opcao.id}>{opcao.texto}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizViewModal;
