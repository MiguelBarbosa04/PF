import React, { useEffect, useState } from 'react';
import IconMenu from "../components/IconMenu.jsx";
import '../assets/css/IconMenuWrapper.css';
import '../assets/css/EditarTema.css';
import { FaRegEdit, FaRegSave, FaSearch, FaTrashAlt } from "react-icons/fa";
import { TbCircleX } from "react-icons/tb";
import { useNavigate } from "react-router";
import { getTemas, updateTema, deleteTema } from "../services/api.js";

const EditarTema = () => {
  const [temas, setTemas] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedNome, setEditedNome] = useState('');

useEffect(() => {
  async function fetchTemas() {
    try {
      const data = await getTemas();
      const dataComId = data.map((tema, index) => ({
        ...tema,
        id: tema.id || index
      }));
      setTemas(dataComId);
    } catch (error) {
      console.error("Erro ao buscar temas:", error);
    }
  }
  fetchTemas();
}, []);

const handleEdit = (id, Nome) => {
  setEditId(id);
  setEditedNome(Nome);
};

const handleSave = async (id) => {
  try {
    // Atualiza tema no backend (inclui Chroma)
    await updateTema(id, { Nome: editedNome });

    // Atualiza estado local React para refletir mudança
    setTemas(temas.map(tema =>
      tema.id === id ? { ...tema, Nome: editedNome } : tema
    ));

    setEditId(null);
    setEditedNome('');
  } catch (error) {
    console.error("Erro ao atualizar tema:", error);
  }
};

const handleCancel = () => {
  setEditId(null);
  setEditedNome('');
};

const handleDelete = async (id) => {
  if (!window.confirm("Tem certeza que quer apagar este tema?")) return;

  try {
    // Apaga tema no backend (inclui Chroma)
    await deleteTema(id);

    // Atualiza estado local React removendo o tema
    setTemas(temas.filter(tema => tema.id !== id));
  } catch (error) {
    console.error("Erro ao apagar tema:", error);
  }
};

  const filteredTemas = temas.filter(tema =>
    typeof tema?.Nome === 'string' && tema.Nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="editar-tema-container">
      <div className="user-profile-wrapper">
        <IconMenu />
      </div>
      <h2 className="editar-tema-title">Editar temas</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar tema..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon"><FaSearch /></span>
      </div>
      <div className="editar-tema-card">
        <table className="tema-table">
          <thead>
            <tr>
              <th>Tema</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemas.map((tema) => (
              <tr key={tema.id}>
                <td className="tema-nome">
                  {editId === tema.id ? (
                    <input
                      type="text"
                      value={editedNome}
                      onChange={(e) => setEditedNome(e.target.value)}
                    />
                  ) : (
                    tema.Nome
                  )}
                </td>
                <td>
                  {editId === tema.id ? (
                    <div className="save-btn">
                      <FaRegSave onClick={() => handleSave(tema.id)} className="card-icon-save" />
                      <TbCircleX onClick={handleCancel} className="card-icon-cancel" />
                    </div>

                  ) : (
                    <>
                      <FaRegEdit onClick={() => handleEdit(tema.id, tema.Nome)} className="card-icon-edit" />
                      <FaTrashAlt onClick={() => handleDelete(tema.id)} className="card-icon-trash" />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="button-perfil">
        <button type="button" onClick={() => navigate("/tema")}>Voltar</button>
      </div>
    </div>
  );
};

export default EditarTema;
