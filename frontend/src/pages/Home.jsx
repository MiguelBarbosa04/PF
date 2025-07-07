import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

    const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bem-vindo!</h1>
      <button onClick={handleRegisterClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Ir para Registo
      </button>
      <button onClick={handleLoginClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Ir para Login
      </button>
    </div>
  );
};

export default Home;
