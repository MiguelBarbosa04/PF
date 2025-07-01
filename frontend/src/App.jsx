import React from 'react';
import RegisterForm from './components/RegisterForm.jsx';
import api from './api.js';

const App = () => {
  const handleRegister = async (data) => {
    try {
      await api.post('/users', data);
      alert('Utilizador registado com sucesso!');
      // podes fazer refresh da lista ou redirecionar
    } catch (error) {
      alert('Erro ao registar utilizador');
      console.error(error);
    }
  };

  return (
    <div>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
};

export default App;
