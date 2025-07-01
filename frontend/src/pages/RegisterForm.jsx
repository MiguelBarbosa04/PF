import React, { useState } from 'react';
import '../assets/RegisterForm.css';

const RegisterForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    pin: '',
    experiencia: '',
    funcao: '',
    linguagem_preferida: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (!formData[key]) {
        setError(`Por favor, preencha o campo "${key}"`);
        return;
      }
    }
    setError('');
    onSubmit(formData);
    setFormData({
      email: '',
      nome: '',
      pin: '',
      experiencia: '',
      funcao: '',
      linguagem_preferida: '',
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <h2 className="title">Registo de Utilizador</h2>
        {error && <div className="error">{error}</div>}
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
          type="text"
          name="experiencia"
          placeholder="Experiência"
          value={formData.experiencia}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="funcao"
          placeholder="Função"
          value={formData.funcao}
          onChange={handleChange}
          className="input"
        />
        <select required
          name="linguagem_preferida"
          value={formData.linguagem_preferida}
          onChange={handleChange}
          className="input"
        >
          <option value="" disabled selected>Linguagem preferida</option>
          <option value="formal">Formal</option>
          <option value="informal">Informal</option>
        </select>
        <button type="submit">Registar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
