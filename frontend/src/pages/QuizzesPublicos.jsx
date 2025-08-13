import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import QuizModal from "../components/QuizModal.jsx";
import "../assets/css/HistoricoQuizzes.css";
import IconMenu from "../components/IconMenu.jsx";
import {FaAngleLeft, FaAngleRight, FaSearch, FaTimes} from "react-icons/fa";
import {useLanguage} from "../locales/LanguageContext.jsx";

function QuizzesPublicos() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [quizParaFazer, setQuizParaFazer] = useState(null);
  const url = import.meta.env.VITE_API_URL;
  const quizzesPorPagina = 5;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    carregarQuizzes();
  }, []);

    const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPaginaAtual(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPaginaAtual(0);
  };

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


  const totalPaginas = Math.ceil(quizzes.length / quizzesPorPagina);
  const quizzesPaginaAtual = quizzes.slice(
    paginaAtual * quizzesPorPagina,
    (paginaAtual + 1) * quizzesPorPagina
  );

  return (
    <div className="historico-wrapper">

      <button className="back-button" onClick={() => navigate(-1)}>
        Voltar
      </button>
             <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="historico-container">

        <h2 >Quizzes Públicos</h2>
         <div className="search-quiz-botao-wrapper" style={{ width: '15%'}}>
            <div className="search-quiz">
              <input
                type="text"
                placeholder={t("sidebar-search")}
                className="sidebar-search-quiz"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm ? (
                <span className="search-icon clear-icon" onClick={handleClearSearch}>
                  <FaTimes />
                </span>
              ) : (
                <span className="search-icon">
                  <FaSearch />
                </span>
              )}
            </div>
                 </div>
        {loading ? (
          <p>A carregar quizzes públicos...</p>
        ) : quizzes.length === 0 ? (
          <p>Não existem quizzes partilhados no momento.</p>
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
                      onClick={() => setQuizParaFazer(quiz.id)}
                    >
                      Fazer Quiz
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {quizParaFazer && (
              <QuizModal
                quizId={quizParaFazer}
                onClose={() => setQuizParaFazer(null)}
                onRepetido={() => {
                  setQuizParaFazer(null);
                  carregarQuizzes();
                }}
              />
            )}

            {totalPaginas > 1 && (
              <div className="paginacao-wrapper">
                <div className="paginacao-bloco">
                  <button
                    className="seta"
                    onClick={() =>
                      setPaginaAtual((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={paginaAtual === 0}
                  >
                     <FaAngleLeft style={{paddingTop: '3px', fontSize: '20px'}}/>
                  </button>
                  <span className="pagina-atual">
                    Página {paginaAtual + 1} de {totalPaginas}
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
      </div>
    </div>
  );
}

export default QuizzesPublicos;
