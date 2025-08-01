import React, {useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Sidebar.css";
import TokenInfo from "./TokenInfo.jsx";
import {
  FaSearch,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
  FaEllipsisH,
  FaTimes,
  FaQuestionCircle,
  FaComment,
  FaFileAlt,
  FaComments,
  FaUserEdit, FaSignOutAlt
} from "react-icons/fa";
import {logout, deleteSession, getSessionsByUserOrdered} from "../services/api.js";
import ChatOptionsMenu from "./ChatOptionsMenu.jsx";
import {useParams} from "react-router";
import {FaNoteSticky} from "react-icons/fa6";


const Sidebar = ({modo, setModo, refreshTrigger, onQuizRequested}) => {
  const navigate = useNavigate();
  const userData = TokenInfo();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);
  const { sessionId } = useParams();
  const [ttsProvider, setTtsProvider] = useState(localStorage.getItem("ttsProvider") || "azure");

    const handleIrParaHistorico = () => {
     navigate(`/historico-quizzes/${userData.id}`);
  };


  const fetchSessions = async () => {
    try {
      if (userData?.id) {
        const userSessions = await getSessionsByUserOrdered(userData.id);
        if (userData.funcao === 7) {
          setIsAdmin(true);
        }
        const papelSelecionado = localStorage.getItem("papel");
        const sessionsFiltradas = userSessions.filter(
          (s) => s.papel === papelSelecionado
        );
        setSessions(sessionsFiltradas);
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userData, sessionId, refreshTrigger]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setShowMenu(prev => !prev);
  const toggleSessionMenu = (sessionId) => {
    setActiveMenuId(prev => prev === sessionId ? null : sessionId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFicheirosClick = () => {
    navigate("/upload");
  };
  const handleTrocaChatClick = () => {
    navigate("/welcome");
  };
  const handleEditarPerfilClick = () => {
    navigate("/perfil");
  };

  const handleFeedbackClick = () => {
    navigate("/feedback");
  };

   const handleAlternarModo = () => {
    setModo((prev) => (prev === "exploratório" ? "instrucional" : "exploratório"));
  };

   const handleAlternarTTS = () => {
    setTtsProvider((prev) => {
      const next = prev === "azure" ? "web" : "azure";
      localStorage.setItem("ttsProvider", next);
      return next;
    });
  };

  const filteredSessions = sessions.filter((session) =>
    (session.tema || "chat sem tema").toLowerCase().includes(searchTerm)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="search">
          <input
            type="text"
            placeholder="Procura"
            className="sidebar-search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm ? (
            <span className="search-icon clear-icon" onClick={handleClearSearch}>
              <FaTimes />
            </span>
          ) : (
            <span className="search-icon">
              <FaSearch />
            </span>
          )}
        </div>
        <button className="new-chat-btn" onClick={() => navigate("/tema")}>
          Novo Chat <FaPlus />
        </button>
      </div>

      <div className="sidebar-chats">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div key={session.id} className="chat-item-wrapper">
              <div
                className={`chat-item 
                ${String(session.id) === String(sessionId) ? "chat-item-selected" : ""}`}
                onClick={() => navigate(`/chat/${session.id}`)}
              >
                <span className="chat-tema">
                  {session.tema || "Chat sem tema"}
                </span>
                <div
                  className="chat-options"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSessionMenu(session.id);
                  }}
                >
                  <FaEllipsisH className={"fa-options"}/>
                </div>
              </div>

              {activeMenuId === session.id && (
                <ChatOptionsMenu
                  ref={menuRef}
                  session={session}
                  userData={userData}
                  onQuizRequested={onQuizRequested}
                  onSessionUpdated={(id, novoTema) => {
                    setSessions((prev) =>
                      prev.map((s) =>
                        s.id === id ? { ...s, tema: novoTema } : s
                      )
                    );
                    setActiveMenuId(null);
                  }}
                  onDelete={(id) => {
                    deleteSession(id)
                      .then(() => {
                        setSessions((prev) =>
                          prev.filter((s) => s.id !== id)
                        );
                        setActiveMenuId(null);

                        const currentPath = window.location.pathname;
                        if (currentPath.includes(`/chat/${id}`)) {
                          navigate("/chat");
                        }
                      })
                      .catch(console.error);
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-chats-msg">
            <p>Sem chats encontrados.</p>
          </div>
        )}
      </div>

      <div className="sidebar-user">
        <div className="user-info" onClick={toggleMenu}>
          <div className="user-circle">{userData.initials}</div>
          <span className="username">{userData.nome}</span>
          <span className="arrow">
            {showMenu ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </div>

        <ul className={`sidebar-actions ${showMenu ? "menu-open" : "menu-closed"}`}>
          {isAdmin && (
              <li onClick={handleFicheirosClick}><FaFileAlt/> Ficheiros e LLM</li>
          )}
          <li onClick={handleAlternarModo}>
            <FaNoteSticky/> Modo: {modo === "exploratório" ? "Exploratório" : "Instrucional"}
          </li>
          <li onClick={handleAlternarTTS}>
            <FaNoteSticky/> TTS: {ttsProvider === "azure" ? "Azure" : "Web"}
          </li>
                    <li onClick={handleIrParaHistorico}>
            <FaQuestionCircle /> Histórico de Quizzes
          </li>
          {isAdmin && (
            <li onClick={handleFeedbackClick}><FaComment/> Feedback</li>
          )}

          <li onClick={handleTrocaChatClick}><FaComments/> Trocar chat</li>
          <li onClick={handleEditarPerfilClick}><FaUserEdit/> Editar Perfil</li>
          <li onClick={handleLogout}><FaSignOutAlt/> Sair</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;