import React from 'react';
import { useNavigate } from 'react-router';
import '../assets/css/Welcome.css';
import '../assets/css/IconMenuWrapper.css';
import {FaRobot} from "react-icons/fa";
import IconMenu from "../components/IconMenu.jsx";
import TokenInfo from "../components/TokenInfo.jsx";

const Welcome = () => {
  const navigate = useNavigate();
  const userData = TokenInfo();  // chama o hook aqui dentro do componente

  if (!userData) return <div>Carregando...</div>;

  const handleEscolhaPapel = (papelEscolhido) => {
      localStorage.setItem("papel", papelEscolhido); // 'agente' ou 'tutor'
      navigate("/tema");
    };

  return (
      <div className="homepage-container">
          <div className="user-profile-wrapper">
              <IconMenu/>
          </div>
          <h1 className="welcome-title">Bem-vindo {userData.nome}!</h1>
          <div className="card-container">
              <div className="card">
                  <FaRobot className="card-icon"/>
                 <button className="card-button" onClick={() => handleEscolhaPapel("Agente")}>Agente</button>
              </div>
              <div className="card">
                  <FaRobot className="card-icon"/>
                <button className="card-button" onClick={() => handleEscolhaPapel("Tutor")}>Tutor</button>
              </div>
          </div>
      </div>

  );
};

export default Welcome;
