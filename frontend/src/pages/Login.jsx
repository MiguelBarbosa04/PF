import React from 'react';
import LoginForm from "../components/LoginForm.jsx";
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();


  const handleLogin = (email) => {
    alert("Login efetuado com sucesso!");
    navigate('/welcome');
  };

  return (
       <LoginForm onLogin={handleLogin} />
  );
};

export default Login;