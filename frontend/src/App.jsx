import React, { useState } from 'react';
import RegisterForm from './pages/RegisterForm.jsx';
import LoginForm from './pages/LoginForm.jsx';
import { createUser } from './api/api.js';

const App = () => {
  const [view, setView] = useState('register'); // 'register' ou 'login'
  const [userEmail, setUserEmail] = useState(null); // só para mostrar quem fez login

  const handleRegister = async (data) => {
    try {
      await createUser(data);
      alert('Utilizador registado com sucesso!');
      setView('login'); // após registo, vai para login
    } catch (error) {
      alert('Erro ao registar utilizador');
      console.error(error);
    }
  };

  const handleLogin = (email) => {
    setUserEmail(email);
    alert("Login efetuado com sucesso!");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setView('register')}>Registar</button>
        <button onClick={() => setView('login')}>Login</button>
      </div>

      {userEmail && (
        <div style={{ marginBottom: '20px', color: 'green' }}>
          <strong>Bem-vindo, {userEmail}!</strong>
        </div>
      )}

      {view === 'register' && <RegisterForm onSubmit={handleRegister} />}
      {view === 'login' && <LoginForm onLogin={handleLogin} />}
    </div>
  );
};

export default App;
