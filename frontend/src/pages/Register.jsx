import React from 'react';
import { useNavigate } from 'react-router';
import { createUser } from "../services/api.js";
import RegisterForm from "../components/RegisterForm.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRegister = async (data) => {
    try {
      await createUser(data);
      alert(t("Register-alert"));
      navigate('/login'); // vai para a página de login
    } catch (error) {
      alert(t("Register-error-alert"));
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <LanguageSwitcher/>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;
