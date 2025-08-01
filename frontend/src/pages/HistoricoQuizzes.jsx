import QuizRepeatModal from "../components/QuizRepeatModal";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import QuizDetalhes from "../components/QuizDetalhes";
import "../assets/css/HistoricoQuizzes.css";
import EstatisticasChart from "../components/EstatisticasChart";


function HistoricoQuizzes() {
  const { userId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizSelecionado, setQuizSelecionado] = useState(null);
  const [quizParaRepetir, setQuizParaRepetir] = useState(null); // NOVO
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!userId) {
      console.warn("userId está undefined. Não foi feita a fetch.");
      return;
    }

    const endpoint = `${url}/quizzes/historico/${userId}`;
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Erro ao carregar histórico:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="historico-container">
      <h2>Histórico de Quizzes</h2>

  {userId && <EstatisticasChart userId={userId} />}

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
                  onClick={() => {console.log("Repetir quiz com id:", quiz.id);
                    setQuizParaRepetir(quiz.id)} }// MODIFICADO
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
        />
      )}
    </div>
  );
}
export default HistoricoQuizzes;