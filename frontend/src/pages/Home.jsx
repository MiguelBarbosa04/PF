import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaRobot } from "react-icons/fa";
import "../assets/css/Home.css";
import {useLanguage} from "../locales/LanguageContext.jsx";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          <h1 className="splash-title">{t("home-splash-title")}</h1>
          <p className="splash-subtitle">{t("home-splash-subtitle")}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
