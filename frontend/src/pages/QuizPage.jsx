import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../assets/css/QuizPage.css';

const QuizPage = () => {

  const {id} = useParams();
  const { id: sessionId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/quizzes/session/${sessionId}`);
        setQuiz(response.data);
      } catch (error) {
        console.error("Erro ao buscar o quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
}, [sessionId]);

  if (loading) return <p>A carregar quiz...</p>;
  if (!quiz) return <p>Nenhum quiz criado.</p>;

return (
  <div className="quiz-container">
    <h2 className="quiz-title">{quiz.titulo}</h2>
    <p className="quiz-description">{quiz.descricao}</p>
    {quiz.perguntas.map((pergunta, index) => (
      <div key={pergunta.id} className="pergunta">
        <h4>{index + 1}. {pergunta.enunciado}</h4>
        <ul className="opcoes">
          {pergunta.opcoes.map((opcao) => (
            <li key={opcao.id}>{opcao.texto}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

};

export default QuizPage;