import {useLanguage} from "../locales/LanguageContext.jsx";

const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useLanguage();

  return (
    <div style={{ position: "absolute", textAlign: "right", top: "10px", left:"10px", display: "flex"}}>
      <button style={{width: "10rem", marginRight: "1rem" }} onClick={() => changeLanguage("pt")} disabled={lang === "pt"}>
        🇵🇹 Português
      </button>{" "}
      <button style={{width: "10rem", marginRight: "1rem" }} onClick={() => changeLanguage("en")} disabled={lang === "en"}>
        🇬🇧 English
      </button>
    </div>
  );
};

export default LanguageSwitcher;