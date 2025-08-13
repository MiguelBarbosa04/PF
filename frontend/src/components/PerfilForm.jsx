import React, {useEffect, useState} from 'react';
import TokenInfo from "./TokenInfo.jsx";
import {getExperiencias, getFuncoes, getLinguagens, updateUser} from "../services/api.js";
import {useNavigate} from "react-router";
import "../assets/css/PerfilForm.css"
import {useLanguage} from "../locales/LanguageContext.jsx";

const PerfilForm = () => {
    const userData = TokenInfo();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [experiencias, setExperiencias] = useState([]);
    const [funcoes, setFuncoes] = useState([]);
    const [linguagens, setLinguagens] = useState([]);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        nome: "",
        password: "",
        confirmPassword: "",
        experiencia: "",
        funcao: "",
        ling_preferida: "",
      });

    useEffect(() => {
        if (userData) {
          setFormData((prev) => ({
            ...prev,
            nome: userData.nome || "",
            email: userData.email || "",
            experiencia: userData.experiencia || "",
            funcao: userData.funcao || "",
            ling_preferida: userData.linguagem|| "",
          }));
        }
      }, [userData]);

    useEffect(() => {
        const fetchOptions = async () => {
          try {
            const [exp, func, ling] = await Promise.all([
              getExperiencias(),
              getFuncoes(),
              getLinguagens()
            ]);
            const isAdmin = userData?.funcao === 7;

            const funcoesFiltradas = isAdmin
                ? func
                : func.filter(f => f.nome !== "Administrador");

            setExperiencias(exp);
            setFuncoes(funcoesFiltradas);
            setLinguagens(ling);
          } catch (err) {
            setError(t("PerfilForm-error"));
          }
        };
        fetchOptions();
      }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
        setError(t("PerfilForm-error-pass"));
        setSuccess("");
        return;
      }

      try {
        const userId = userData.id;
        const updatePayload = {
          nome: formData.nome,
          email: formData.email,
          funcao: parseInt(formData.funcao),
          ling_preferida: parseInt(formData.ling_preferida),
          experiencia: parseInt(formData.experiencia),
          ...(formData.password ? { password: formData.password } : {})
        };

        await updateUser(userId, updatePayload);
        setSuccess(t("PerfilForm-success"));
        setError("");
        alert(t("perfil-alert"));
        navigate(-1);
      } catch (err) {
        setError(err.message);
        setSuccess("");
      }
    };

    if (!userData) return <div>{t("register-loading")}</div>;
    return (
    <div className="container">
        <form onSubmit={handleSubmit} className="form">
            <h2 className="title">{t("perfil-title")}</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <input
                type="email"
                name="email"
                placeholder={t("email-placeholder")}
                value={formData.email}
                onChange={handleChange}
                className="input"
            />
            <input
                type="text"
                name="nome"
                placeholder={t("name-placeholder")}
                value={formData.nome}
                onChange={handleChange}
                className="input"
            />
            <input
                type="password"
                name="password"
                placeholder={t("password-placeholder")}
                value={formData.password}
                onChange={handleChange}
                className="input"
            />

            <input
                type="password"
                name="confirmPassword"
                placeholder={t("password-again-placeholder")}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
            />

            <select
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                className="input"
                required
            >
                <option value="" disabled>{t("register-experience-place")}</option>
                {experiencias.length > 0 ? (
                    experiencias.map(exp => (
                        <option key={exp.id} value={exp.id}>{t(exp.nome)}</option>
                    ))
                ) : (
                    <option disabled>{t("register-loading")}</option>
                )}
            </select>
            <select
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                className="input"
                required
            >
                <option value="" disabled>{t("register-role-place")}</option>
                {funcoes.length > 0 ? (
                    funcoes.map(func => (
                        <option key={func.id} value={func.id}>{t(func.nome)}</option>
                    ))
                ) : (
                    <option disabled>{t("register-loading")}</option>
                )}
            </select>
            <select
                name="ling_preferida"
                value={formData.ling_preferida}
                onChange={handleChange}
                className="input"
                required
            >
                <option value="" disabled>{t("register-lang-place")}</option>
                {linguagens.length > 0 ? (
                    linguagens.map(ling => (
                        <option key={ling.id} value={ling.id}>{t(ling.nome)}</option>
                    ))
                ) : (
                    <option disabled>{t("register-loading")}</option>
                )}
            </select>
            <div className="button-perfil">
                <button type="button" onClick={() => navigate(-1)}>{t("back-btn")}</button>
                <button type="submit">{t("update-btn")}</button>
            </div>

        </form>
    </div>
    );
};

export default PerfilForm;