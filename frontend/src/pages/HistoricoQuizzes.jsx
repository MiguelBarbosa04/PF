import QuizRepeatModal from "../components/QuizRepeatModal";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import QuizDetalhes from "../components/QuizDetalhes";
import "../assets/css/HistoricoQuizzes.css";
import Estatisticas from "../components/Estatisticas.jsx";
import {useNavigate} from "react-router";
import "../assets/css/IconMenuWrapper.css";
import IconMenu from "../components/IconMenu.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";
import {FaAngleLeft, FaAngleRight} from "react-icons/fa";

function HistoricoQuizzes() {
  const { userId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizSelecionado, setQuizSelecionado] = useState(null);
  const [quizParaRepetir, setQuizParaRepetir] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const quizzesPorPagina = 5;
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { t } = useLanguage();

const handleBack = () => {
    navigate(-1);
  };
  const quizzesPaginaAtual = quizzes.slice(
    paginaAtual * quizzesPorPagina,
    (paginaAtual + 1) * quizzesPorPagina
  );

  const totalPaginas = Math.ceil(quizzes.length / quizzesPorPagina);

  const carregarQuizzes = () => {
    if (!userId) {
      console.warn(t("quiz-history-error-fetch-user"));
      return;
    }
    setLoading(true);
    const endpoint = `${url}/quizzes/historico/${userId}`;
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const dataOrdenada = data.sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );
        setQuizzes(dataOrdenada);
      })
      .catch((err) => console.error(t("quiz-history-error"), err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarQuizzes();
  }, [userId]);

  return (
    <div className="historico-wrapper">
      <button className="back-button" onClick={handleBack}>
        {t("back-btn")}
      </button>
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="historico-container">
        <h2>{t("quiz-history-title")}</h2>

        {userId && (
          <div className="estatisticas-bloco">
            <Estatisticas userId={userId} />
          </div>
        )}

        {loading ? (
          <p>{t("register-loading")}</p>
        ) : quizSelecionado ? (
          <QuizDetalhes
            quizId={quizSelecionado.id}
            userId={userId}
            onVoltar={() => setQuizSelecionado(null)}
          />
        ) : quizzes.length === 0 ? (
          <p>{t("quizzes-not-found")}</p>
        ) : (
          <>
            <ul className="quiz-list">
              {quizzesPaginaAtual.map((quiz) => (
                <li key={quiz.id} className="quiz-item">
                  <div className="quiz-info">
                    <strong>{quiz.titulo}</strong>
                    <time>{dayjs(quiz.data).format("DD/MM/YYYY HH:mm")}</time>
                  </div>
                  <div className="quiz-botoes">
                    <button
                      className="botao-ver"
                      onClick={() => setQuizSelecionado(quiz)}
                    >
                      {t("view-btn")}
                    </button>
                    <button
                      className="botao-repetir"
                      onClick={() => setQuizParaRepetir(quiz.id)}
                    >
                      {t("repeat-btn")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {totalPaginas > 1 && (
              <div className="paginacao-wrapper">
                <div className="paginacao-bloco">
                  <button
                    className="seta"
                    onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 0))}
                    disabled={paginaAtual === 0}
                  >
                    <FaAngleLeft style={{paddingTop: '3px', fontSize: '20px'}}/>
                  </button>
                  <span className="pagina-atual">
                    {t("feedback-page")} {paginaAtual + 1} {t("feedback-of")} {totalPaginas}
                  </span>
                  <button
                    className="seta"
                    onClick={() =>
                      setPaginaAtual((prev) =>
                        Math.min(prev + 1, totalPaginas - 1)
                      )
                    }
                    disabled={paginaAtual === totalPaginas - 1}
                  >
                    <FaAngleRight style={{paddingTop: '3px', fontSize: '20px'}}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {quizParaRepetir && (
          <QuizRepeatModal
            quizId={quizParaRepetir}
            onClose={() => setQuizParaRepetir(null)}
            onRepetido={() => {
              setQuizParaRepetir(null);
              carregarQuizzes();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default HistoricoQuizzes;
