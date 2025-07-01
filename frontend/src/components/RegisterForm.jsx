import React, { useState } from 'react';

const RegisterForm = ({ addUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    pin: '',
    experiencia: '',
    funcao: '',
    linguagem_preferida: 'formal', // valor inicial
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // opcional: validação simples
    if (
      formData.email &&
      formData.nome &&
      formData.pin &&
      formData.experiencia &&
      formData.funcao &&
      formData.linguagem_preferida
    ) {
      addUser(formData);
      setFormData({
        email: '',
        nome: '',
        pin: '',
        experiencia: '',
        funcao: '',
        linguagem_preferida: 'formal',
      });
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="text"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        placeholder="Nome"
        required
      />
      <input
        type="password"
        name="pin"
        value={formData.pin}
        onChange={handleChange}
        placeholder="PIN"
        required
      />
      <input
        type="text"
        name="experiencia"
        value={formData.experiencia}
        onChange={handleChange}
        placeholder="Experiência"
        required
      />
      <input
        type="text"
        name="funcao"
        value={formData.funcao}
        onChange={handleChange}
        placeholder="Função"
        required
      />
      <select
        name="linguagem_preferida"
        value={formData.linguagem_preferida}
        onChange={handleChange}
        required
      >
        <option value="formal">Formal</option>
        <option value="informal">Informal</option>
      </select>
      <button type="submit">Adicionar Utilizador</button>
    </form>
  );
};

export default RegisterForm;
