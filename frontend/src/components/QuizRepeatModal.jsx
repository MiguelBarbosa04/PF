import React, { useEffect, useState } from "react";
import { corrigirRespostasQuiz, getQuizById } from "../services/api";
import getTokenInfo from "./TokenInfo";
import "../assets/css/Modal.css";

const QuizRepeatModal = ({ quizId, onClose }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const [correcoes, setCorrecoes] = useState(null);
  const user_id = getTokenInfo().id;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuizById(quizId);
        setQuiz(quizData);
      } catch (error) {
        console.error("Erro ao carregar quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (perguntaId, opcaoId) => {
    if (!correcoes) {
      setRespostas((prev) => ({
        ...prev,
        [perguntaId]: opcaoId
      }));
    }
  };

  const enviarRespostas = async () => {
    const todasRespondidas = quiz.perguntas.every((p) => respostas[p.id] != null);
    if (!todasRespondidas) {
      alert("Responde a todas as perguntas!");
      return;
    }

    const payload = {
      user_id,
      respostas,
      respondido_em: new Date().toISOString()
    };

    try {
      const resultado = await corrigirRespostasQuiz(quizId, payload);
      const correcoesMap = {};
      resultado.resultados.forEach((item) => {
        correcoesMap[item.pergunta_id] = item;
      });
      setCorrecoes(correcoesMap);
    } catch (error) {
      alert("Erro ao enviar respostas.");
    }
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content"><p>A carregar...</p></div></div>;
  if (!quiz) return <div className="modal-overlay"><div className="modal-content"><p>Quiz não encontrado.</p></div></div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>Fechar</button>
        <h2 className="quiz-title">{quiz.titulo}</h2>
        {quiz.perguntas.map((pergunta, idx) => (
          <div key={pergunta.id} className="pergunta">
            <h4>{idx + 1}. {pergunta.enunciado}</h4>
            <ul className="opcoes">
              {pergunta.opcoes.map((opcao) => {
                const selecionada = respostas[pergunta.id] === opcao.id;
                const correcao = correcoes?.[pergunta.id];
                const correta = correcao?.resposta_correta === opcao.id;
                const errada = correcao?.resposta_user === opcao.id && !correcao.correta;

                return (
                  <li key={opcao.id}>
                    <label className={`opcao-cartao ${correta ? "correta" : ""} ${errada ? "errada" : ""}`}>
                      <input
                        type="radio"
                        name={`pergunta-${pergunta.id}`}
                        value={opcao.id}
                        checked={selecionada}
                        onChange={() => handleSelectOption(pergunta.id, opcao.id)}
                        disabled={!!correcoes}
                      />
                      <span>{opcao.texto}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <button
          onClick={enviarRespostas}
          className={correcoes ? "btn-disabled" : "btn-submit"}
          disabled={!!correcoes}
        >
          {correcoes ? "Respostas Enviadas" : "Enviar Respostas"}
        </button>
      </div>
    </div>
  );
};

export default QuizRepeatModal;
