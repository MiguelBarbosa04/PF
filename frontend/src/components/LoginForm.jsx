import React, { useState } from 'react';
import { loginUser } from '../services/api.js';
import '../assets/css/LoginForm.css';
import { Link } from "react-router";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.access_token);

      localStorage.setItem("token_type", data.token_type);

      onLogin(email);  // Passar também `data` se depois for para guardar o token
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="container">
          <form onSubmit={handleSubmit} className="form">
              <h2 className="title">Login</h2>
              {error && <p style={{color: 'red'}}>{error}</p>}

              <p className="label">Digite o seu email e password</p>
              <input
                  type="email"
                  placeholder="Email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
              />
              <input
                  type="password"
                  placeholder="Password"
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
              />
              <button type="submit">Entrar</button>
              <p>Se não tem conta, faça <Link to="/register">Registo</Link></p>
          </form>
      </div>
  );
};

export default LoginForm;