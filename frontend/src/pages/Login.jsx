import React from 'react';
import LoginForm from "../components/LoginForm.jsx";

const Login = () => {

  const handleLogin = (email) => {
    alert("Login efetuado com sucesso!");
  };

  return (
       <LoginForm onLogin={handleLogin} />
  );
};

export default Login;