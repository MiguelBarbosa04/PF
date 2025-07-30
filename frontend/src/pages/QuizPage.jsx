import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../assets/css/QuizPage.css';
import { corrigirRespostasQuiz, getQuizBySession } from "../services/api.js";
import getTokenInfo from "../components/TokenInfo.jsx";

const QuizPage = () => {
  const { sessionId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const [correcoes, setCorrecoes] = useState(null);

  const user_id = getTokenInfo().id;

  useEffect(() => {
    (async () => {
      try {
        const quizData = await getQuizBySession(sessionId);
        setQuiz(quizData);
      } catch (error) {
        console.error("Erro ao buscar o quiz:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const handleSelectOption = (perguntaId, opcaoId) => {
    if (!correcoes) {
      setRespostas((prev) => ({
        ...prev,
        [perguntaId]: opcaoId
      }));
    }
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
      const resultado = await corrigirRespostasQuiz(quiz.id, payload);

      // Transformar lista de resultados num objeto indexado por pergunta_id
      const correcoesMap = {};
      resultado.resultados.forEach((item) => {
        correcoesMap[item.pergunta_id] = item;
      });

      setCorrecoes(correcoesMap);

      alert("Respostas enviadas com sucesso!");
      console.log("Resultado:", resultado);
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
            {pergunta.opcoes.map((opcao) => {
              const selecionada = respostas[pergunta.id] === opcao.id;
              const correcao = correcoes?.[pergunta.id];
              const correta = correcao && correcao.resposta_correta === opcao.id;
              const errada = correcao && correcao.resposta_user === opcao.id && !correcao.correta;

              return (
                <li key={opcao.id}>
                  <label
                    className={
                      "opcao-cartao " +
                      (correta ? "correta" : (errada ? "errada" : ""))
                    }
                  >
                    <input
                      type="radio"
                      name={`pergunta-${pergunta.id}`}
                      value={opcao.id}
                      checked={selecionada}
                      onChange={() => handleSelectOption(pergunta.id, opcao.id)}
                      disabled={!!correcoes}
                    />
                    <span>{opcao.texto}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <button
        onClick={enviarRespostas}
        disabled={!!correcoes}
        className={correcoes ? "btn-disabled" : "btn-submit"}
      >
        {correcoes ? "Respostas Enviadas" : "Enviar Respostas"}
      </button>
    </div>
  );
};

export default QuizPage;
