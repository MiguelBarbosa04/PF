import {FaFileUpload} from "react-icons/fa";
import React, {useEffect} from "react";
import '../assets/css/UploadPage.css';
import {getLLM} from "../services/api.js";

const UploadForm = ({ handleFileChange, handleGuardar, handleGuardarLLM,
                      selectedLLM, setSelectedLLM, tema, setTema, navigate, file }) => {

  useEffect(() => {
    const fetchLLM = async () => {
      try {
        const llmR = await getLLM();
        setSelectedLLM(llmR.modelo);
      } catch (error) {
        console.error("Erro ao carregar LLM:", error);
      }
    };
    fetchLLM();
  }, []);

  return (
      <div className="upload-container">
        <div className="cards-wrapper">
          <div className="upload-card">
            <h2 className="upload-title">Upload Ficheiros</h2>
            <label className="upload-button-label">
              <FaFileUpload className="upload-icon"/>
              Adicionar Ficheiro
              <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
              />
            </label>
            {/* Mostrar nome do ficheiro */}
            {file && (
                <p className="selected-file-name">
                  Ficheiro selecionado: <strong>{file.name}</strong>
                </p>
            )}

            <div className="button-group">
              <button className="save-button" onClick={handleGuardar}>Guardar Ficheiro</button>
            </div>
          </div>
          <div className="llm-card">
            <h2 className="upload-title">Escolha LLM</h2>
            <select
                name="modelo"
                onChange={(e) => setSelectedLLM(e.target.value)}
                className="input"
                value={selectedLLM}
                required
            >
              <option value="" disabled>Escolha o modelo</option>
              <option value="mistral">Mistral (Local)</option>
              <option value="gemini">Gemini (Cloud)</option>
            </select>

            <div className="button-group">
              <button className="save-button" onClick={handleGuardarLLM}>Guardar LLM</button>
            </div>
          </div>
        </div>
        <div className="cancel-wrapper">
          <button className="cancel-button" onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </div>
  );
};

export default UploadForm;