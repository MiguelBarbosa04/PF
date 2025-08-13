import { useEffect, useState } from "react";
import axios from "axios";
import {useLanguage} from "../locales/LanguageContext.jsx";

function Estatisticas({ userId }) {
  const [mediaAcertos, setMediaAcertos] = useState(null);
  const [totalQuizzes, setTotalQuizzes] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!userId) return;
    const url = import.meta.env.VITE_API_URL;
    axios.get(`${url}/estatisticas/${userId}`)
      .then((res) => {
        setTotalQuizzes(res.data.total_quizzes);
        setMediaAcertos(res.data.media_percentagem_acertos);
      })
      .catch((err) => {
        console.error(t("statistics-error-fetching"), err);
      });
  }, [userId]);

  if (mediaAcertos === null || totalQuizzes === null) return null;

  return (
    <div className="estatisticas-info">
      <p><strong>{t("statistics-total")}:</strong> {totalQuizzes}</p>
      <p><strong>{t("statistics-avg")}:</strong> {mediaAcertos.toFixed(1)}%</p>
    </div>
  );
}

export default Estatisticas;
