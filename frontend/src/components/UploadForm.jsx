import {FaFileUpload} from "react-icons/fa";
import React from "react";
import '../assets/css/UploadPage.css';

const UploadForm = ({ handleFileChange, handleGuardar, tema, setTema, navigate }) => {
  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload Ficheiros</h2>

        <label className="upload-button-label">
          <FaFileUpload className="upload-icon" />
          Adicionar Ficheiro
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>

        <div className="button-group">
          <button className="cancel-button" onClick={() => navigate('/tema')}>Cancelar</button>
          <button className="save-button" onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;