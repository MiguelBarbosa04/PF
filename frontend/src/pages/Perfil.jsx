import React from "react";
import PerfilForm from "../components/PerfilForm.jsx";
import {updateUser} from "../services/api.js";
import {useNavigate} from "react-router";


const Perfil = () => {
    const navigate = useNavigate();
    const handleUpdate = async (data) => {
    try {
        await updateUser(data)
        alert('Utilizador atualizados com sucesso!');
        navigate('/login'); // vai para a página de login
    } catch (error) {
      alert('Erro ao fazer atualizar os dados do utilizador');
      console.error(error);
    }
  };

    return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <PerfilForm/>
    </div>
  );
};

export default Perfil;