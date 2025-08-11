import React from 'react';
import LoginForm from "../components/LoginForm.jsx";
import { useNavigate } from 'react-router';
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = (email) => {
    alert(t("login-alert"));
    navigate('/welcome');
  };

  return (
      <>
        <LanguageSwitcher/>
        <LoginForm onLogin={handleLogin} />
      </>
  );
};

export default Login;