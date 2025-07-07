import React, {useEffect, useState, useRef} from "react";
import "../assets/css/UserProfile.css";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import {getCurrentUser} from "../services/api.js";
import { useNavigate } from "react-router-dom";

const generateInitials = (nome) => {
  if (!nome) return "";

  const partes = nome.trim().split(" ");
  if (partes.length === 1) {
    return partes[0][0].toUpperCase();
  }

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

const UserProfile = ({ onLogout }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    initials: "",
  });

  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate("/perfil");
  };

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getCurrentUser();
      if (data) {
        const initials = generateInitials(data.nome);
        setUserData({
          name: data.nome,
          email: data.email,
          initials,
        });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setShowMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

return (
    <div className="user-profile" ref={profileRef}>
      <div className="avatar" onClick={toggleMenu}>
        {userData.initials}
      </div>

      {showMenu && (
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-name">{userData.name}</div>
            <div className="profile-email">{userData.email}</div>
          </div>

          <div className="profile-divider" />

          <div className="profile-actions">
            <button className="action-button" onClick={handleEditClick}>
              <FaCog className="action-icon" />
              Editar Perfil
            </button>
            <button className="action-button" onClick={onLogout}>
              <FaSignOutAlt className="action-icon" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;