import { useLanguage } from "../locales/LanguageContext.jsx";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "pt", label: "Português", flag: "🇵🇹" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const selectedLanguage = languages.find((l) => l.code === lang);

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
      }}
    >
      {/* Botão principal */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "white",
          fontSize: "1.2rem",
          padding: "0.4rem 0.8rem",
          cursor: "pointer",
          border: "1px solid #ccc",
          borderRadius: "0.4rem",
          minWidth: "5.5rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontSize: "1.4rem", marginRight: "0.5rem" }}>
          {selectedLanguage.flag}
        </span>
        <FaChevronDown style={{ fontSize: "0.8rem", color: "#333" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "0.4rem",
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            marginTop: "0.2rem",
            width: "10rem",
          }}
        >
          {languages.map((language) => (
            <div
              key={language.code}
              onClick={() => {
                changeLanguage(language.code);
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: language.code === lang ? "#f8f9fa" : "white",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  language.code === lang ? "#f8f9fa" : "white")
              }
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.3rem" }}>{language.flag}</span>
                {language.label}
              </span>
              {language.code === lang && <span>✔</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
