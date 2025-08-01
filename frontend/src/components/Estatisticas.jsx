import { useEffect, useState } from "react";
import axios from "axios";

function Estatisticas({ userId }) {
  const [mediaAcertos, setMediaAcertos] = useState(null);
  const [totalQuizzes, setTotalQuizzes] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const url = import.meta.env.VITE_API_URL;
    axios.get(`${url}/estatisticas/${userId}`)
      .then((res) => {
        setTotalQuizzes(res.data.total_quizzes);
        setMediaAcertos(res.data.media_percentagem_acertos);
      })
      .catch((err) => {
        console.error("Erro ao buscar estatísticas:", err);
      });
  }, [userId]);

  if (mediaAcertos === null || totalQuizzes === null) return null;

  return (
    <div className="estatisticas-info">
      <p><strong>Total de quizzes feitos:</strong> {totalQuizzes}</p>
      <p><strong>Média de perguntas corretas:</strong> {mediaAcertos.toFixed(1)}%</p>
    </div>
  );
}

export default Estatisticas;
