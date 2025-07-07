import React, {useEffect, useState} from 'react';
import TokenInfo from "./TokenInfo.jsx";
import {getExperiencias, getFuncoes, getLinguagens, updateUser} from "../services/api.js";
import {useNavigate} from "react-router";

const PerfilForm = () => {
    const userData = TokenInfo();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [experiencias, setExperiencias] = useState([]);
    const [funcoes, setFuncoes] = useState([]);
    const [linguagens, setLinguagens] = useState([]);

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
            setExperiencias(exp);
            setFuncoes(func);
            setLinguagens(ling);
          } catch (err) {
            setError("Erro ao carregar dados");
          }
        };
        fetchOptions();
      }, []);

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
        setError("As passwords não coincidem");
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
        setSuccess("Perfil atualizado com sucesso!");
        setError("");
        alert("Perfil atualizado com sucesso!");
        navigate("/welcome");
      } catch (err) {
        setError(err.message);
        setSuccess("");
      }
    };

    if (!userData) return <div>Carregando...</div>;
    return (
    <div className="container">
        <form onSubmit={handleSubmit} className="form">
            <h2 className="title">Registo de Utilizador</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input"
            />
            <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={formData.nome}
                onChange={handleChange}
                className="input"
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input"
            />

            <input
                type="password"
                name="confirmPassword"
                placeholder="Repita Password"
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
                <option value="" disabled>Experiência</option>
                {experiencias.length > 0 ? (
                    experiencias.map(exp => (
                        <option key={exp.id} value={exp.id}>{exp.nome}</option>
                    ))
                ) : (
                    <option disabled>Carregando....</option>
                )}
            </select>
            <select
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                className="input"
                required
            >
                <option value="" disabled>Função</option>
                {funcoes.length > 0 ? (
                    funcoes.map(func => (
                        <option key={func.id} value={func.id}>{func.nome}</option>
                    ))
                ) : (
                    <option disabled>Carregando....</option>
                )}
            </select>
            <select
                name="ling_preferida"
                value={formData.ling_preferida}
                onChange={handleChange}
                className="input"
                required
            >
                <option value="" disabled>Linguagem preferida</option>
                {linguagens.length > 0 ? (
                    linguagens.map(ling => (
                        <option key={ling.id} value={ling.id}>{ling.nome}</option>
                    ))
                ) : (
                    <option disabled>Carregando....</option>
                )}
            </select>

            <button type="submit">Atualizar</button>
        </form>
    </div>
    );
};

export default PerfilForm;