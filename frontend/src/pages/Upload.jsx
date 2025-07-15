import React, {useState} from 'react';
import '../assets/css/UploadPage.css';
import { useNavigate } from 'react-router';
import UploadForm from "../components/UploadForm.jsx";
import IconMenu from "../components/IconMenu.jsx";

const Upload = () => {

  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [tema, setTema] = useState('');

  const handleFileChange = (event) => {
  const file = event.target.files[0];
  setFile(selectedFile);
  console.log('Ficheiro selecionado:', selectedFile);
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    // Aqui podes tratar o upload (ex: com FormData)
    alert("Ficheiro guardado com sucesso!");
  };


 return (
    <div>
      <div className="user-profile-wrapper">
              <IconMenu/>
          </div>
      <UploadForm
        handleFileChange={handleFileChange}
        handleGuardar={handleGuardar}
        tema={tema}
        setTema={setTema}
        navigate={navigate}
      />
    </div>
  );
};
export default Upload;