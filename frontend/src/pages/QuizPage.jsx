import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../assets/css/QuizPage.css';
import { corrigirRespostasQuiz, getQuizBySession } from "../services/api.js";
import getTokenInfo from "../components/TokenInfo.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";

const QuizPage = ({sessionId: propSessionId}) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const [correcoes, setCorrecoes] = useState(null);
  const routeParams = useParams();
  const sessionId = propSessionId || routeParams.sessionId;
  const user_id = getTokenInfo().id;
  const { t } = useLanguage();

  useEffect(() => {
    (async () => {
      try {
        const quizData = await getQuizBySession(sessionId);
        setQuiz(quizData);
      } catch (error) {
        console.error(t("quiz-error-fetching"), error);
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
      alert(t("alert-quiz-page-load"));
      return;
    }

    const todasRespondidas = quiz.perguntas.every((pergunta) =>
      respostas[pergunta.id] !== undefined && respostas[pergunta.id] !== null
    );

    if (!todasRespondidas) {
      alert(t("quiz-page-alert"));
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

      alert(t("alert-answer-success"));
      console.log("Resultado:", resultado);
    } catch (error) {
      console.error(t("alert-error-submitting-a"), error);
      alert(t("alert-quiz-try-again"));
    }
  };

  if (loading) return <p>{t("register-loading")}</p>;
  if (!quiz) return <p>{t("no-quiz-created")}</p>;

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
        {correcoes ? t("quiz-answers-sent") : t("send-answers-btn")}
      </button>
    </div>
  );
};

export default QuizPage;
