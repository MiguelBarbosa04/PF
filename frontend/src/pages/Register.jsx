import React from 'react';
import { useNavigate } from 'react-router';
import { createUser } from "../services/api.js";
import RegisterForm from "../components/RegisterForm.jsx";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    try {
      await createUser(data);
      alert('Utilizador registado com sucesso!');
      navigate('/login'); // vai para a página de login
    } catch (error) {
      alert('Erro ao registar utilizador');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;
