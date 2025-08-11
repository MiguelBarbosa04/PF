import React, {createContext, useContext, useEffect, useState} from "react";
import pt from "./pt.json";
import en from "./en.json";

const translations = { pt, en };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang && translations[storedLang]) {
      setLang(storedLang);
    }
  }, []);

  const t = (key, vars = {}) => {
    let text = translations[lang][key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, v);
    });
    return text;
  };

  const changeLanguage = (lng) => {
    if (translations[lng]) {
      setLang(lng);
      localStorage.setItem("language", lng);  // grava a linguagem no localStorage
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);