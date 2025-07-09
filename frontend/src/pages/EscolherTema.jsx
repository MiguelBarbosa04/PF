import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import '../assets/css/EscolherTema.css';
import { useNavigate } from 'react-router';
import { getCurrentUser } from "../services/api.js";
import IconMenu from "../components/IconMenu.jsx";
import '../assets/css/IconMenuWrapper.css';
import '../assets/css/EscolherTema.css';

const EscolherTema = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user.funcao === 7) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Erro ao verificar função do utilizador:", error);
      }
    };

    fetchUser();
  }, []);

  const temas = [
    { label: 'Pesquisa avançada', value: '/tema/pesquisa-avancada' },
    { label: 'Procedimentos Operacionais', value: '/tema/procedimentos' },
    { label: 'Resolução de Problemas', value: '/tema/resolucao' },
    { label: 'Manutenção', value: '/tema/manutencao' },
  ];

  const handleTemaSelect = (selectedOption) => {
    setSelectedTema(selectedOption);
    if (selectedOption) {
      navigate(selectedOption.value);
    }
  };

  return (
    <div className="tema-container">
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="tema-card">
        <h2 className="tema-title">Escolha o tema</h2>
        <Select
          options={temas}
          value={selectedTema}
          onChange={handleTemaSelect}
          placeholder="Pesquise ou selecione um tema..."
          isClearable
          className="tema-select"
        />
           <div className="button-perfil">
          <button type="button" onClick={() => navigate("/editar_tema")}>Editar</button>
        </div>
        <div className="button-perfil">
          <button type="button" onClick={() => navigate("/welcome")}>Voltar</button>
        </div>
        {isAdmin && (
          <button
            className="upload-button"
            onClick={() => navigate('/upload')}
          >
            📄 Upload de ficheiros
          </button>
        )}
      </div>
    </div>
  );
};

export default EscolherTema;
