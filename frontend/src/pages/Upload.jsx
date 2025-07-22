import React, {useState} from 'react';
import '../assets/css/UploadPage.css';
import { useNavigate } from 'react-router';
import UploadForm from "../components/UploadForm.jsx";
import IconMenu from "../components/IconMenu.jsx";
import {updateLLM, uploadPDF} from "../services/api.js";

const Upload = () => {

  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [tema, setTema] = useState('');
  const [selectedLLM, setSelectedLLM] = useState("");

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      setFile(file);
  };

  const handleGuardar = async (e) => {
      e.preventDefault();

      if (!file) {
        alert("Por favor selecione um ficheiro antes de guardar.");
        return;
      }

      try {
        const data = await uploadPDF(file);
        alert(data.message);
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
        alert(error.message);
      }
    };

  const handleGuardarLLM = async () => {
    if (!selectedLLM) {
      alert("Por favor selecione um modelo LLM.");
      return;
    }

    try {
      await updateLLM(selectedLLM);
      alert("Modelo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao guardar modelo:", error);
      alert(error.message);
    }
  };

 return (
    <div>
      <div className="user-profile-wrapper">
              <IconMenu/>
          </div>
      <UploadForm
        handleFileChange={handleFileChange}
        handleGuardar={handleGuardar}
        handleGuardarLLM={handleGuardarLLM}
        selectedLLM={selectedLLM}
        setSelectedLLM={setSelectedLLM}
        tema={tema}
        setTema={setTema}
        navigate={navigate}
        file={file}
      />
    </div>
  );
};
export default Upload;