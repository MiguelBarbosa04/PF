import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from 'dayjs';
import '../assets/css/HistoricoQuizzes.css';

function HistoricoQuizzes() {
  const { userId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!userId) return;

    fetch(`${url}/quizzes/historico/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return res.json();
      })
      .then(setQuizzes)
      .catch((err) => console.error("Erro ao carregar histórico:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="historico-container">
      <h2>Histórico de Quizzes</h2>
      {loading ? (
        <p>A carregar...</p>
      ) : quizzes.length === 0 ? (
        <p>Não foram encontrados quizzes.</p>
      ) : (
        <ul className="quiz-list">
          {quizzes.map((quiz) => (
            <li className="quiz-item" key={quiz.id}>
              <strong>Título:</strong> {quiz.titulo} <br />
              <strong>Data:</strong>{" "}
              <time>{dayjs(quiz.data).format("DD/MM/YYYY HH:mm")}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoricoQuizzes;
