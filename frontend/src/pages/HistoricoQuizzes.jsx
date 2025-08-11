import QuizModal from "../components/QuizModal.jsx";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import QuizDetalhes from "../components/QuizDetalhes";
import "../assets/css/HistoricoQuizzes.css";
import Estatisticas from "../components/Estatisticas.jsx";
import { useNavigate } from "react-router";
import "../assets/css/IconMenuWrapper.css";
import IconMenu from "../components/IconMenu.jsx";
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
      console.warn("userId está undefined. Não foi feita a fetch.");
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
      .catch((err) => console.error("Erro ao carregar histórico:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarQuizzes();
  }, [userId]);

  const atualizarPartilha = (quizId, novoValor) => {
    const valorString = novoValor ? "true" : "false";
    const fullUrl = `${url}/quizzes/${quizId}/partilhar?partilhar=${valorString}`;
    console.log("URL completa do PUT:", fullUrl);

    fetch(fullUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Resposta status:", res.status);
        if (!res.ok) {
          throw new Error("Erro ao atualizar partilha");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Resposta JSON:", data);
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quizId ? { ...q, partilhado: novoValor } : q
          )
        );
      })
      .catch((err) => console.error("Erro ao atualizar partilha:", err));
  };

  return (
    <div className="historico-wrapper">
      <button className="back-button" onClick={handleBack}>
        Voltar
      </button>
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="historico-container">
        <h2>Histórico de Quizzes</h2>
         <div className="estatistica-botao-quizzes-publicos">
        {userId && (
          <div className="estatisticas-bloco">
            <Estatisticas userId={userId} />
          </div>
        )}
        <button
              className="botao-quizzes-publicos"
              onClick={() => navigate("/quizzes/publicos")}
            >
              Ver Quizzes Públicos
            </button>

         </div>
        {loading ? (
          <p>A carregar...</p>
        ) : quizSelecionado ? (
          <QuizDetalhes
            quizId={quizSelecionado.id}
            userId={userId}
            onVoltar={() => setQuizSelecionado(null)}
          />
        ) : quizzes.length === 0 ? (
          <p>Não foram encontrados quizzes.</p>
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
                      Ver
                    </button>
                    <button
                      className="botao-repetir"
                      onClick={() => setQuizParaRepetir(quiz.id)}
                    >
                      Repetir
                    </button>
                    <label className="checkbox-partilhar">
                      <input
                        type="checkbox"
                        checked={quiz.partilhado || false}
                        onChange={(e) =>
                          atualizarPartilha(quiz.id, e.target.checked)
                        }
                      />
                      Partilhar
                    </label>
                  </div>
                </li>
              ))}
            </ul>

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

        {quizParaRepetir && (
          <QuizModal
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
