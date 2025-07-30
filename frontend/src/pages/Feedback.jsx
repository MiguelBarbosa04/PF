import React, { useEffect, useState } from 'react';
import { getRatedMessages, getRatedModels } from '../services/api';
import StarsRating from "../components/StarsRating.jsx";
import "../assets/css/IconMenuWrapper.css";
import { FaStar } from "react-icons/fa";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../assets/css/Feedback.css';
import IconMenu from "../components/IconMenu.jsx";
import { useNavigate } from "react-router";

const COLORS = ['#2F5AAE', '#007BFF'];

const FeedbackPage = () => {
  const [mensagens, setMensagens] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [ratingFiltro, setRatingFiltro] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        // Limpa estados para evitar mostrar dados obsoletos
        setMensagens([]);
        setModelos([]);

        const msgs = await getRatedMessages(ratingFiltro);
        let mods = await getRatedModels(ratingFiltro);

        const modelosBase = ['Gemini', 'Mistral'];
        modelosBase.forEach((modeloBase) => {
          const jaTem = mods.some(m => m.modelo.toLowerCase() === modeloBase.toLowerCase() && m.total > 0);
          if (!jaTem) {
            // Se não tem nenhum registro com total > 0 para esse modelo, só adiciona se não existir já com total 0
            const existeZero = mods.some(m => m.modelo.toLowerCase() === modeloBase.toLowerCase());
            if (!existeZero) {
              mods.push({ modelo: modeloBase, total: 0 });
            }
          }
        });

        setMensagens(msgs);
        setModelos(mods);
        setModeloSelecionado(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setMensagens([]);
        setModelos([]);
      }
    }
    fetchData();
  }, [ratingFiltro]);

  const handleBack = () => {
    navigate(-1);
  };

  const sessionCounts = mensagens.reduce((acc, item) => {
    const id = item.resposta.session_id;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="feedback-wrapper">
      <button className="back-button" onClick={handleBack}>
        Voltar
      </button>
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="feedback-page">
        <h1 className="feedback-title">Avaliações</h1>

        <section className="filtro-avaliacao">
          <label htmlFor="rating-select">Filtrar por avaliação:</label>
          <select
              id="rating-select"
              value={ratingFiltro}
              onChange={(e) => setRatingFiltro(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r} estrela{r > 1 ? 's' : ''}</option>
            ))}
          </select>
        </section>
        <h2 className="section-title">
          Dashboard de Avaliações com {ratingFiltro} <FaStar style={{fontSize: '16px'}}/>
        </h2>
        <section className="dashboard-container">
          <div className="dashboard-grid">
            {/* Gráfico de Pizza */}
            <div className="dashboard-chart">
              {modelos.length === 0 || modelos.every(m => m.total === 0) ? (
                  <div className="sem-dados">Sem dados para este filtro</div>
              ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={modelos}
                          dataKey="total"
                          nameKey="modelo"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label
                      >
                        {modelos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip/>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
              )}
            </div>

            {/* Tabela ao lado */}
            <div className="dashboard-table">
              <table>
                <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {modelos.map((modelo, index) => (
                    <tr key={index}>
                      <td>{modelo.modelo}</td>
                      <td>{modelo.total}</td>
                      <td>
                        <button onClick={() => setModeloSelecionado(modelo.modelo)}>
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {modeloSelecionado && (
            <section className="painel-detalhes">
              <h3>Mensagens do modelo: {modeloSelecionado}</h3>
              <button onClick={() => setModeloSelecionado(null)}>Fechar painel</button>

              <div className="mensagens-scroll">
                {mensagens
                    .filter((item) => item.resposta.modelo === modeloSelecionado)
                    .map((item, index) => (
                        <div className="mensagem-card" key={index}>
                          <p><strong>Pergunta:</strong> {item.pergunta?.conteudo || '(sem pergunta)'}</p>
                          <p><strong>Resposta:</strong> {item.resposta.conteudo}</p>
                          <p><strong>Rating:</strong> <StarsRating avaliacao={item.resposta.avaliacao}/></p>
                        </div>
                    ))}
                {mensagens.filter((item) => item.resposta.modelo === modeloSelecionado).length === 0 && (
                    <p>Nenhuma mensagem encontrada para este modelo e avaliação.</p>
                )}
              </div>
            </section>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
