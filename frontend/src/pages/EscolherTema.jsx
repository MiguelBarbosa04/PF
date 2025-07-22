import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import '../assets/css/EscolherTema.css';
import { useNavigate } from 'react-router';
import { getCurrentUser, createSession, getTemas } from "../services/api.js";
import IconMenu from "../components/IconMenu.jsx";
import '../assets/css/IconMenuWrapper.css';

const EscolherTema = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);
  const [userData, setUserData] = useState(null);
  const [temas, setTemas] = useState([]);
  const [loadingTemas, setLoadingTemas] = useState(true);
  const papel = localStorage.getItem("papel");

  // Redireciona para /welcome se não houver papel
  useEffect(() => {
    if (!papel) {
      navigate("/welcome");
    }
  }, [papel, navigate]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserData(user);
        if (user.funcao === 7) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Erro ao verificar função do utilizador:", error);
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const data = await getTemas();
        console.log(data)
        const opcoes = data.map((item) => ({
          label: item.Nome,
          value: item.Nome,
        }));
        setTemas(opcoes);
      } catch (error) {
        console.error("Erro ao buscar temas:", error);
      } finally {
        setLoadingTemas(false);
      }
    };
    fetchTemas();
  }, []);

  const handleTemaSelect = (selectedOption) => {
    setSelectedTema(selectedOption);
    if (selectedOption) {
      localStorage.setItem("tema", selectedOption.label);
    } else {
      localStorage.removeItem("tema");
    }
  };

  const handleIrParaChatDireto = async () => {
    if (!userData) return;

    const temaParaEnviar = selectedTema ? selectedTema.label : null;
    const papelParaEnviar = papel;

    if (!temaParaEnviar) {
      localStorage.removeItem("sessionId");
      localStorage.removeItem("tema");
      localStorage.setItem("papel", papelParaEnviar || "");
      navigate("/chat");
      return;
    }

    try {
      const session = await createSession({
        user_id: userData.id,
        papel: papelParaEnviar,
        tema: temaParaEnviar,
        inicio: new Date().toISOString(),
      });

      localStorage.setItem("sessionId", session.id);
      localStorage.setItem("tema", temaParaEnviar || "");
      localStorage.setItem("papel", papelParaEnviar || "");
      navigate("/chat");
    } catch (error) {
      console.error("Erro ao criar sessão direta:", error);
    }
  };

  return (
    <div className="tema-container">
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <div className="tema-card">
        <h2 className="tema-title">Escolha o tema</h2>

        {loadingTemas ? (
          <p>Carregando temas...</p>
        ) : (
          <Select
            options={temas}
            value={selectedTema}
            onChange={handleTemaSelect}
            placeholder="Pesquise ou selecione um tema..."
            isClearable
            className="tema-select"
          />
        )}

        <div className="button-perfil">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/editar_tema')}
            >
              Editar
            </button>
          )}
        </div>
        <div className="button-perfil">
          <button type="button" onClick={handleIrParaChatDireto}>Ir para o chat</button>
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