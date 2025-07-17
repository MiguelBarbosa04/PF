import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaRobot } from "react-icons/fa";
import "../assets/css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-content">
       <div className="splash-content">
  <FaRobot className="splash-logo" />
  <h1 className="splash-title">Tutor/Agente</h1>
  <p className="splash-subtitle">A sua aprendizagem, guiada por inteligência</p>
</div>
      </div>
    </div>
  );
};

export default Home;
