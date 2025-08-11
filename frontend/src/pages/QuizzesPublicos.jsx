import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "../assets/css/HistoricoQuizzes.css"; // reaproveita CSS do histórico

function QuizzesPublicos() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const quizzesPorPagina = 5;
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
      <div className="historico-container">
        <h2 className="cabecalho-historico">Quizzes Públicos</h2>

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
                      onClick={() => handleFazerQuiz(quiz.id)}
                    >
                      Fazer Quiz
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
                    ◀
                  </button>
                  <span className="pagina-atual">
                    Página {paginaAtual + 1} de {totalPaginas}
                  </span>
                  <button
                    className="seta"
                    onClick={() =>
                      setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas - 1))
                    }
                    disabled={paginaAtual === totalPaginas - 1}
                  >
                    ▶
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
