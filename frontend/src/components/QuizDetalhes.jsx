import React, { useEffect, useState } from "react";
import "../assets/css/QuizDetalhes.css";
import {useLanguage} from "../locales/LanguageContext.jsx";

function QuizDetalhes({ quizId, userId, onVoltar }) {
  const [respostas, setRespostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL;
  const { t } = useLanguage();

  useEffect(() => {
    if (!quizId || !userId) return;

    fetch(`${url}/quizzes/respostas/${quizId}/${userId}`)
      .then((res) => res.json())
      .then((data) => setRespostas(data))
      .catch((err) => console.error(t("quiz-error-fetching-a"), err))
      .finally(() => setLoading(false));
  }, [quizId, userId]);

  if (loading) return <p>{t("register-loading")}</p>;

  return (
    <div className="quiz-detalhes">
     <div className="btn-container">
  <button className="voltar-btn" onClick={onVoltar}>{t("back-btn")}</button>
</div>
      <h3>{t("quiz-details")}</h3>

      {respostas.map((item, index) => (
        <div key={index} className="pergunta-container">
          <h4>{index + 1}. {item.pergunta}</h4>

          <ul className="opcoes-lista">
            {item.opcoes.map((opcao) => {
              const correta = opcao.correta;
              const escolhida = opcao.foi_escolhida;

              let classe = "opcao";
              if (correta) classe += " correta";
              if (escolhida) classe += " escolhida";
              if (correta && escolhida) classe += " correta-escolhida";

              return (
                <li key={opcao.id} className={classe}>
                  {opcao.texto}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default QuizDetalhes;
