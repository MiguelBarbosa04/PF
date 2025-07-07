import React, {useEffect, useState} from 'react';
import { getCurrentUser } from "../services/api.js";

const Perfil = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getCurrentUser();
      setUserData(data);
    }
    fetchData();
  }, []);

  if (!userData) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Editar Perfil</h1>
      <form>
        <input type="text" defaultValue={userData.nome} />
        <input type="email" defaultValue={userData.email} />
        {/* outros campos */}
      </form>
    </div>
  );
};

export default Perfil;