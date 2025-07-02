import React, { useState } from 'react';
import '../assets/RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    pin: '',
    experiencia: '',
    funcao: '',
    ling_preferida: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const response = await fetch("http://localhost:8001/users/", {
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
      setSuccess("Registo concluído com sucesso!");
      setFormData({
        email: '',
        nome: '',
        pin: '',
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
          name="pin"
          placeholder="PIN"
          value={formData.pin}
          onChange={handleChange}
          className="input"
        />
        <input
          type="number"
          name="experiencia"
          placeholder="Experiência"
          value={formData.experiencia}
          onChange={handleChange}
          className="input"
        />
        <input
          type="number"
          name="funcao"
          placeholder="Função"
          value={formData.funcao}
          onChange={handleChange}
          className="input"
        />
        <select
          name="ling_preferida"
          value={formData.ling_preferida}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="" disabled>Linguagem preferida</option>
          <option value="1">Formal</option>
          <option value="2">Informal</option>
        </select>

        <button type="submit">Registar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
