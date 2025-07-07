import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Welcome.css';
import '../assets/css/IconMenuWrapper.css';
import {FaRobot} from "react-icons/fa";
import IconMenu from "../components/IconMenu.jsx";

const Welcome = () => {
  const navigate = useNavigate();

  const handleAgenteClick = () => {
    navigate('/agente');
  };

    const handleTutorClick = () => {
    navigate('/tutor');
  };

  return (
      <div className="homepage-container">
          <div className="user-profile-wrapper">
              <IconMenu/>
          </div>
          <h1 className="welcome-title">Bem-vindo User!</h1>
          <div className="card-container">
              <div className="card">
                  <FaRobot className="card-icon"/>
                  <button className="card-button" onClick={handleAgenteClick}>Agente</button>
              </div>
              <div className="card">
                  <FaRobot className="card-icon"/>
                  <button className="card-button" onClick={handleTutorClick}>Tutor</button>
              </div>
          </div>
      </div>

  );
};

export default Welcome;
