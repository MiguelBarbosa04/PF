import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import RegisterForm from './RegisterForm.jsx';

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erro a buscar utilizadores", error);
    }
  };

  const addUser = async (userData) => {
    try {
      await api.post('/users', userData);
      fetchUsers();
    } catch (error) {
      console.error("Erro a adicionar utilizador", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Lista de Utilizadores</h2>
      <ul>
        {users.map((user, i) => (
          <li key={i}>{user.nome} - {user.email}</li>
        ))}
      </ul>
      <RegisterForm addUser={addUser} />
    </div>
  );
};

export default UserList;
