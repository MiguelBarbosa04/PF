import React, { useEffect, useState } from 'react';
import IconMenu from "../components/IconMenu.jsx";
import '../assets/css/IconMenuWrapper.css';
import '../assets/css/EditarTema.css';
import {FaRegEdit, FaRegSave, FaSearch, FaTrashAlt} from "react-icons/fa";
import {TbCircleX} from "react-icons/tb";
import {useNavigate} from "react-router";

const EditarTema = () => {
  const [temas, setTemas] = useState([
    { id: 1, nome: "Manutenção" },
    { id: 2, nome: "Procedimentos das máquinas principais" },
    { id: 3, nome: "Procedimentos das máquinas secundárias" },
       { id: 4, nome: "Manutenção" },
    { id: 5, nome: "Procedimentos das máquinas principais" },
    { id: 6, nome: "Procedimentos das máquinas secundárias" },
       { id: 7, nome: "Manutenção" },
    { id: 8, nome: "Procedimentos das máquinas principais" },
    { id: 9, nome: "Procedimentos das máquinas secundárias" },
       { id: 10, nome: "Manutenção" },
    { id: 11, nome: "Procedimentos das máquinas principais" },
    { id: 12, nome: "Procedimentos das máquinas secundárias" },
  ]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedNome, setEditedNome] = useState('');

  const handleEdit = (id, nome) => {
    setEditId(id);
    setEditedNome(nome);
  };

  const handleSave = (id) => {
    setTemas(temas.map(tema => (
      tema.id === id ? { ...tema, nome: editedNome } : tema
    )));
    setEditId(null);
    setEditedNome('');
  };

  const handleCancel = () => {
    setEditId(null);
    setEditedNome('');
  };

  const filteredTemas = temas.filter(tema =>
    tema.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="editar-tema-container">
        <div className="user-profile-wrapper">
          <IconMenu/>
        </div>
        <h2 className="editar-tema-title">Editar temas</h2>
        <div className="search-bar">
          <input
              type="text"
              placeholder="Pesquisar tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon"><FaSearch/></span>
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
                        tema.nome
                    )}
                  </td>
                  <td>
                    {editId === tema.id ? (
                        <div className="save-btn">
                          <FaRegSave onClick={() => handleSave(tema.id)} className="card-icon-save"/>
                          <TbCircleX onClick={handleCancel} className="card-icon-cancel"/>
                        </div>

                    ) : (
                        <><FaRegEdit onClick={() => handleEdit(tema.id, tema.nome)} className="card-icon-edit"/>
                          <FaTrashAlt onClick={() => handleEdit(tema.id, tema.nome)} className="card-icon-trash"/>
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
