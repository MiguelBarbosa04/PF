import React, { useEffect, useState } from 'react';
import { getLowRatedMessages, getLowRatedModels } from '../services/api';
import StarsRating from "../components/StarsRating.jsx";

const FeedbackPage = () => {
  const [mensagens, setMensagens] = useState([]);
  const [modelos, setModelos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const msgs = await getLowRatedMessages();
      const mods = await getLowRatedModels();
      setMensagens(msgs);
      setModelos(mods);
    }
    fetchData();
  }, []);

  return (
    <div className="feedback-page">
      <h1 className="feedback-title">Avaliações Baixas</h1>

      <section className="section-modelos">
        <h2 className="section-title">Modelos com mais avaliações 1-3<StarsRating/></h2>
        <ul className="modelo-lista">
          {modelos.map((modelo, index) => (
            <li key={index} className="modelo-item">
              <strong>{modelo.modelo}</strong>: {modelo.total} avaliações baixas
            </li>
          ))}
        </ul>
      </section>

      <section className="section-mensagens">
        <h2 className="section-title">Mensagens Avaliadas com 1-3<StarsRating/></h2>
        {mensagens.map((item, index) => (
          <div className="mensagem-card" key={index}>
            <p className="mensagem-pergunta"><strong>Pergunta:</strong> {item.pergunta?.conteudo || '(sem pergunta anterior)'}</p>
            <p className="mensagem-resposta"><strong>Resposta:</strong> {item.resposta.conteudo}</p>
            <p className="mensagem-meta"><StarsRating/> {item.resposta.avaliacao} — Modelo: {item.resposta.modelo}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FeedbackPage;
