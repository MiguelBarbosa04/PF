import React from "react";
import PerfilForm from "../components/PerfilForm.jsx";
import {updateUser} from "../services/api.js";
import {useNavigate} from "react-router";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";

const Perfil = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const handleUpdate = async (data) => {
    try {
        await updateUser(data)
        alert(t("perfil-alert"));
        navigate('/login'); // vai para a página de login
    } catch (error) {
      alert(t("perfil-error-alert"));
      console.error(error);
    }
  };

    return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <LanguageSwitcher/>
      <PerfilForm/>
    </div>
  );
};

export default Perfil;