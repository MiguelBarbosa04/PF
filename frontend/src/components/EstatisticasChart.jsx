import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

function EstatisticasChart({ userId }) {
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

  const data = [
    { nome: "Média de Acertos (%)", valor: mediaAcertos }
  ];

  return (
    <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
      <h3>Estatísticas Gerais em {totalQuizzes} {totalQuizzes === 1 ? "Quiz" : "Quizzes"}</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis domain={[0,100]}/>
          <Tooltip />
          <Bar dataKey="valor" fill= "#2F5AAE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EstatisticasChart;
