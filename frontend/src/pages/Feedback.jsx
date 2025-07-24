import React, { useEffect, useState } from 'react';
import { getLowRatedMessages, getLowRatedModels } from '../services/api';
import StarsRating from "../components/StarsRating.jsx";
import "../assets/css/IconMenuWrapper.css";
import { FaStar } from "react-icons/fa";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../assets/css/Feedback.css';
import IconMenu from "../components/IconMenu.jsx";
import {useNavigate} from "react-router";

const COLORS = ['#2F5AAE', '#007BFF'];

const FeedbackPage = () => {
  const [mensagens, setMensagens] = useState([]);
  const [modelos, setModelos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const msgs = await getLowRatedMessages();
      const mods = await getLowRatedModels();
      setMensagens(msgs);
      setModelos(mods);
    }
    fetchData();
  }, []);

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
          <IconMenu/>
        </div>
        <div className="feedback-page">
          <h1 className="feedback-title">Avaliações Baixas</h1>

          <section className="section-modelos">
            <h2 className="section-title">Distribuição por Modelo <FaStar style={{fontSize: '16px'}}/></h2>
            <div className="grafico-container">
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
            </div>
          </section>

          <section className="section-mensagens">
            <h2 className="section-title">Mensagens com 1-3 <FaStar style={{fontSize: '16px'}}/></h2>
            <div className="mensagens-scroll">
              {mensagens.map((item, index) => {
                const sessionId = item.resposta.session_id;
                const count = sessionCounts[sessionId];
                let chatClass = "mensagem-chat";
                if (count > 2) {
                  chatClass += " mensagem-chat-vermelho";
                } else if (count > 1) {
                  chatClass += " mensagem-chat-amarelo";
                }
                return(
                  <div className="mensagem-card" key={index}>
                    <p className={chatClass}>Chat: {item.resposta.session_id}</p>
                    <p className="mensagem-pergunta">
                      <strong>Pergunta:</strong> {item.pergunta?.conteudo || '(sem pergunta anterior)'}
                    </p>
                    <p className="mensagem-resposta"><strong>Resposta:</strong> {item.resposta.conteudo}</p>
                    <p className="mensagem-meta">
                      <StarsRating avaliacao={item.resposta.avaliacao}/>
                      Modelo: {item.resposta.modelo}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
  );
};

export default FeedbackPage;