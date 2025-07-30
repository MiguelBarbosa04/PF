import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../assets/css/QuizPage.css';
import getTokenInfo from "../services/api.js";

const QuizPage = () => {
  const { sessionId: sessionId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const { quizId } = useParams();

  const user_id = getTokenInfo();

  useEffect(() => {
  (async () => {
    try {
      const response = await axios.get(`http://localhost:8000/quizzes/session/quiz/${sessionId}`);
      setQuiz(response.data);
    } catch (error) {
      console.error("Erro ao buscar o quiz:", error);
    } finally {
      setLoading(false);
    }
  })();
}, [sessionId]);


  const handleSelectOption = (perguntaId, opcaoId) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: opcaoId
    }));
  };

const enviarRespostas = async () => {
  if (!quiz || !quiz.perguntas) {
    alert("Quiz não carregado corretamente.");
    return;
  }

  const todasRespondidas = quiz.perguntas.every((pergunta) =>
    respostas[pergunta.id] !== undefined && respostas[pergunta.id] !== null
  );

  if (!todasRespondidas) {
    alert("Por favor, responde a todas as perguntas antes de submeter.");
    return;
  }

  const payload = {
    user_id,
    respostas,
    respondido_em: new Date().toISOString()
  };

  try {
    const response = await axios.post(
      `http://localhost:8000/quizzes/${quiz.id}/respostas/corrigir`,
      payload
    );
    alert("Respostas enviadas com sucesso!");
    console.log("Resultado:", response.data);
  } catch (error) {
    console.error("Erro ao enviar respostas:", error);
    alert("Erro ao enviar respostas, tenta novamente.");
  }
};

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
    <li key={opcao.id}>
      <label>
        <span>{opcao.texto}</span>
        <input
          type="radio"
          name={`pergunta-${pergunta.id}`}
          value={opcao.id}
          checked={respostas[pergunta.id] === opcao.id}
          onChange={() => handleSelectOption(pergunta.id, opcao.id)}
        />
      </label>
    </li>
  ))}
</ul>

        </div>
      ))}

      <button
        onClick={enviarRespostas}
        //disabled={Object.keys(respostas).length !== quiz.perguntas.length}
      >
        Enviar Respostas
      </button>
    </div>
  );
};

export default QuizPage;