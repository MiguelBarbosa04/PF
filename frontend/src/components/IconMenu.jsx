import React, {useEffect, useState, useRef} from "react";
import "../assets/css/IconMenu.css";
import {FaCog, FaComment, FaGlobe, FaSignOutAlt} from "react-icons/fa";
import { logout } from "../services/api.js";
import { useNavigate } from "react-router";
import TokenInfo from "./TokenInfo.jsx";
import {useLanguage} from "../locales/LanguageContext.jsx";

const IconMenu = () => {

  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { lang, changeLanguage, t } = useLanguage();

  const handleEditClick = () => {
    navigate("/perfil");
  };

  const handleFeedbackClick = () => {
    navigate("/feedback/");
  };

  const toggleMenu = () => setShowMenu((prev) => !prev);

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

  const userData = TokenInfo();
  useEffect(() => {
    if (userData?.funcao === 7) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userData]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

return (
    <div className="user-profile" ref={profileRef}>
      <div className="avatar" onClick={toggleMenu}>
        {userData.initials}
      </div>

      {showMenu && (
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-name">{userData.nome}</div>
            <div className="profile-email">{userData.email}</div>
          </div>

          <div className="profile-divider" />

          <div className="profile-actions">
            <button className="action-button" onClick={handleEditClick}>
              <FaCog className="action-icon"/>
              {t("icon-menu-editar")}
            </button>
            {isAdmin && (
                <button className="action-button" onClick={handleFeedbackClick}>
                  <FaComment className="action-icon"/>
                  Feedback
                </button>
            )}
            <button className="action-button" onClick={() => {
              const newLang = lang === "pt" ? "en" : "pt";
              changeLanguage(newLang);
              localStorage.setItem("language", newLang);
            }}>
              <FaGlobe/> {t("icon-menu-lang")}: {lang.toUpperCase()}
            </button>
            <button className="action-button" onClick={handleLogout}>
              <FaSignOutAlt className="action-icon"/>
              {t("icon-menu-logout")}
            </button>
          </div>
        </div>
      )}
    </div>
);
};

export default IconMenu;