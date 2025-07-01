import React from 'react';
import RegisterForm from './pages/RegisterForm.jsx';
import { createUser } from './api/api.js'; // <--- importa corretamente

const App = () => {
  const handleRegister = async (data) => {
    try {
      await createUser(data); // <--- usa a função correta
      alert('Utilizador registado com sucesso!');
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
