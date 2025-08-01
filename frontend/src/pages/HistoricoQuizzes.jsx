import QuizRepeatModal from "../components/QuizRepeatModal";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import QuizDetalhes from "../components/QuizDetalhes";
import "../assets/css/HistoricoQuizzes.css";
import Estatisticas from "../components/Estatisticas.jsx";

function HistoricoQuizzes() {
  const { userId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizSelecionado, setQuizSelecionado] = useState(null);
  const [quizParaRepetir, setQuizParaRepetir] = useState(null);
  const url = import.meta.env.VITE_API_URL;

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
      // Ordena do mais recente para o mais antigo pela propriedade 'data'
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

  return (
      <div className="historico-wrapper">
    <div className="historico-container">
      <h2>Histórico de Quizzes</h2>

    {userId && (
  <Estatisticas userId={userId} />
  )}


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
        <ul className="quiz-list">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="quiz-item">
              <div className="quiz-info">
                <strong>{quiz.titulo}</strong>
                <br />
                <em>{dayjs(quiz.data).format("DD/MM/YYYY HH:mm")}</em>
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
                  onClick={() => {
                    console.log("Repetir quiz com id:", quiz.id);
                    setQuizParaRepetir(quiz.id);
                  }}
                >
                  Repetir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {quizParaRepetir && (
        <QuizRepeatModal
          quizId={quizParaRepetir}
          onClose={() => setQuizParaRepetir(null)}
          onRepetido={() => {
            setQuizParaRepetir(null);
            carregarQuizzes(); // Atualiza o histórico quando fechar modal após repetir
          }}
        />
      )}
    </div>
      </div>
  );
}

export default HistoricoQuizzes;
