import {useEffect, useState} from "react";
import {getCurrentUser} from "../services/api.js";
import {useNavigate} from "react-router";
import {useLanguage} from "../locales/LanguageContext.jsx";

const generateInitials = (nome) => {
  if (!nome) return "";

  const partes = nome.trim().split(" ");
  if (partes.length === 1) {
    return partes[0][0].toUpperCase();
  }

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};



const TokenInfo = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        id: "",
        nome: "",
        email: "",
        funcao: "",
        linguagem: "",
        experiencia: "",
        initials: "",
    });

    useEffect(() => {
    const fetchUserData = async () => {
        try {
            const data = await getCurrentUser();
            if (data) {
                const initials = generateInitials(data.nome);
                setUserData({
                  id: data.id,
                  nome: data.nome,
                  email: data.email,
                  funcao: data.funcao,
                  linguagem: data.linguagem,
                  experiencia: data.experiencia,
                  initials,
                });
            }
        }catch (err){
            console.error(t("TokenInfo-error"), err);
            if (err.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("token_type");
                navigate("/login");
            }
        }
    };

    fetchUserData();
  }, [navigate]);

  return userData;


};


export default TokenInfo;