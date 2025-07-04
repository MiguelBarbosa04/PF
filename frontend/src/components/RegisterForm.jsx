import React, { useState, useEffect } from 'react';
import '../assets/RegisterForm.css';
import { useNavigate } from "react-router";


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    password: '',
    experiencia: '',
    funcao: '',
    ling_preferida: '',
  });


 const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [experiencias, setExperiencias] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [linguagens, setLinguagens] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [expRes, funcRes, lingRes] = await Promise.all([
          fetch("http://localhost:8000/users/experiencia"),
          fetch("http://localhost:8000/users/funcao"),
          fetch("http://localhost:8000/users/linguagem"),
        ]);

        setExperiencias(await expRes.json());
        setFuncoes(await funcRes.json());
        setLinguagens(await lingRes.json());
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
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

    for (const key in formData) {
      if (!formData[key]) {
        setError(`Por favor, preencha o campo "${key}"`);
        setSuccess('');
        return;
      }
    }

    setError('');

    try {
      const response = await fetch("http://localhost:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro no registo");
      }

      const data = await response.json();
      console.log("Utilizador registado:", data);
      alert("Registo concluído com sucesso");

      navigate("/login");

      setFormData({
        email: '',
        nome: '',
        password: '',
        experiencia: '',
        funcao: '',
        ling_preferida: '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

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

        <select
          name="experiencia"
          value={formData.experiencia}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="" disabled>Experiência</option>
          {experiencias.length > 0 ? (
              experiencias.map(exp=>(
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
          {funcoes.length > 0 ? (
            linguagens.map(ling => (
                <option key={ling.id} value={ling.id}>{ling.nome}</option>
            ))
          ) : (
              <option disabled>Carregando....</option>
          )}
        </select>

        <button type="submit">Registar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
