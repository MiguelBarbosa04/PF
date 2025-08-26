import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Welcome.css";
import "../assets/css/IconMenuWrapper.css";
import IconMenu from "../components/IconMenu.jsx";
import TokenInfo from "../components/TokenInfo.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";
import {RiRobot3Line} from "react-icons/ri";
import { GrRobot } from "react-icons/gr";

const Welcome = () => {
  const { t } = useLanguage();

  const roleOptions = [
      {
        key: "Agente",
        label: "agent-label",
        description:
          "agent-desc",
        icon: <RiRobot3Line className="role-card-icon" />,
      },
      {
        key: "Tutor",
        label: "tutor-label",
        description:
          "tutor-desc",
        icon: <GrRobot className="role-card-icon" />,
      },
  ];

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

      <h1 className="welcome-title">{t("welcome-h1")} {userData.nome}!</h1>

      <div className="role-card-container">
        {roleOptions.map((role) => (
          <button
            key={role.key}
            type="button"
            className="role-card"
            onClick={() => handleEscolhaPapel(role.key)}
            aria-label={`Entrar como ${t(role.labelKey)}`}
          >
            {role.icon}
            <h2 className="role-card-title">{t(role.label)}</h2>
            <p className="role-card-desc">{t(role.description)}</p>
            <span className="role-card-cta">{t("enter-btn")}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Welcome;