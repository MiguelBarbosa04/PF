import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom"; // <-- recomendo 'react-router-dom'
import "../assets/css/Welcome.css";
import "../assets/css/IconMenuWrapper.css";
import { FaRobot } from "react-icons/fa";
import IconMenu from "../components/IconMenu.jsx";
import TokenInfo from "../components/TokenInfo.jsx";

const roleOptions = [
  {
    key: "Agente",
    label: "Agente",
    description:
      "Assistente conversacional capaz de responder a questões sobre procedimentos, manuais técnicos e instruções operacionais.",
  },
  {
    key: "Tutor",
    label: "Tutor",
    description:
      "Tutor virtual interativo que guia novos operadores durante a integração, adaptando explicações com base na experiência e função.",
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const userData = TokenInfo(); // chama o hook aqui dentro do componente

  const handleEscolhaPapel = useCallback(
    (papelEscolhido) => {
      // guarda um valor previsível/slug
      localStorage.setItem("papel", papelEscolhido); // 'agente' ou 'tutor'
      navigate("/tema");
    },
    [navigate]
  );

  if (!userData) return <div>Carregando...</div>;

  return (
    <div className="homepage-container">
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>

      <h1 className="welcome-title">Bem-vindo {userData.nome}!</h1>

      <div className="role-card-container">
        {roleOptions.map((role) => (
          <button
            key={role.key}
            type="button"
            className="role-card"
            onClick={() => handleEscolhaPapel(role.key)}
            aria-label={`Entrar como ${role.label}`}
          >
            <FaRobot className="role-card-icon" />
            <h2 className="role-card-title">{role.label}</h2>
            <p className="role-card-desc">{role.description}</p>
            <span className="role-card-cta">Entrar</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Welcome;