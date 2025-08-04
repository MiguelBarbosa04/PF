import React, { useState } from 'react';
import { loginUser } from '../services/api.js';
import '../assets/css/LoginForm.css';
import { Link } from "react-router";
import {useLanguage} from "../locales/LanguageContext.jsx";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.access_token);

      localStorage.setItem("token_type", data.token_type);

      onLogin(email);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="container">
          <form onSubmit={handleSubmit} className="form">
              <h2 className="title">{t("login-title")}</h2>
              {error && <p style={{color: 'red'}}>{error}</p>}

              <p className="label">{t("login-label")}</p>
              <input
                  type="email"
                  placeholder={t("email-placeholder")}
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
              />
              <input
                  type="password"
                  placeholder={t("password-placeholder")}
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
              />
              <button type="submit">{t("login-btn")}</button>
              <p>{t("login-p")} <Link to="/register">{t("login-link")}</Link></p>
          </form>
      </div>
  );
};

export default LoginForm;