import React, { useEffect, useState } from 'react';
import '../assets/css/EscolherTema.css';
import { useNavigate } from 'react-router';
import {getCurrentUser} from "../services/api.js";
import IconMenu from "../components/IconMenu.jsx";
import '../assets/css/IconMenuWrapper.css';

const EscolherTema = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

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
    { nome: 'Pesquisa avançada', path: '/tema/pesquisa-avancada' },
    { nome: 'Procedimentos Operacionais', path: '/tema/procedimentos' },
    { nome: 'Resolução de Problemas', path: '/tema/resolucao' },
    { nome: 'Manutenção', path: '/tema/manutencao' },
  ];

  return (
    <div className="tema-container">
    <div className="user-profile-wrapper">
              <IconMenu/>
          </div>
      <div className="tema-card">
        <h2 className="tema-title">Escolha o tema</h2>
        {temas.map((tema, index) => (
          <button
            key={index}
            className="tema-button"
            onClick={() => navigate(tema.path)}
          >
            {tema.nome}
          </button>
        ))}
        <div className="button-perfil">
                <button type="button" onClick={() => navigate(-1)}>Voltar</button>
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
