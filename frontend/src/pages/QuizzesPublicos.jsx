import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import dayjs from "dayjs";
import "../assets/css/QuizzesPublicos.css";

function QuizzesPublicos() {

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();


  const carregarQuizzes = () => {
    setLoading(true);
    fetch(`${url}/quizzes/quizzes/publicos`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Erro ao carregar quizzes públicos:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarQuizzes();
  }, []);

  const handleFazerQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`); // Redireciona para a página de fazer quiz
  };

  return (
    <div className="quizzes-publicos-wrapper">
      <h2>Quizzes Partilhados</h2>

      {loading ? (
        <p>A carregar...</p>
      ) : quizzes.length === 0 ? (
        <p>Não existem quizzes partilhados no momento.</p>
      ) : (
        <ul className="quizzes-list">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="quiz-item-publico">
              <div className="quiz-info-publico">
                <strong>{quiz.titulo}</strong>
                <time>{dayjs(quiz.data).format("DD/MM/YYYY HH:mm")}</time>
              </div>
              <button
                className="botao-fazer"
                onClick={() => handleFazerQuiz(quiz.id)}
              >
                Fazer Quiz
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QuizzesPublicos;
