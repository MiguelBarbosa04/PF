import axios from "axios";

const API_URL = 'http://localhost:8000';

export async function createUser(userData) {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.[0]?.msg || "Erro desconhecido");
  }

  return response.json();
}

export async function loginUser({ email, password }) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Erro ao autenticar");
  }

  return response.json();
}

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const token_type = localStorage.getItem("token_type");
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `${token_type} ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar o utilizador autenticado");
  }

  return await response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
};

export async function updateUser(id, userData) {
  const token = localStorage.getItem("token");
  const token_type = localStorage.getItem("token_type");
  console.log("Payload enviado para update:", userData)
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PUT", // ou PATCH, dependendo do backend
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token_type} ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao atualizar utilizador");
  }

  return await response.json();
}

export async function getExperiencias() {
  const response = await fetch(`${API_URL}/users/experiencia`);
  if (!response.ok) {
    throw new Error("Erro ao buscar experiências");
  }
  return await response.json();
}

export async function getFuncoes() {
  const response = await fetch(`${API_URL}/users/funcao`);
  if (!response.ok) {
    throw new Error("Erro ao buscar experiências");
  }
  return await response.json();
}

export async function getLinguagens() {
  const response = await fetch(`${API_URL}/users/linguagem`);
  if (!response.ok) {
    throw new Error("Erro ao buscar experiências");
  }
  return await response.json();
}

export const createSession = async (sessionData) => {
  const response = await fetch(`${API_URL}/sessions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar sessão");
  }

  return await response.json();
};

export const sendMessage = async (messageData) => {
   const token = localStorage.getItem("token");
   const token_type = localStorage.getItem("token_type");
   const res = await fetch(`${API_URL}/messages/`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `${token_type} ${token}`,
    },
    body: JSON.stringify(messageData),
   });

   if (!res.ok) {
    throw new Error("Erro ao enviar mensagem");
  }

   return await res.json();
};


export const getMessagesBySession = async (sessionId) => {
  const response = await axios.get(`${API_URL}/messages/session/${sessionId}`);
  return response.data;
};

export const rateMessage = async (messageId, avaliacao) => {
  const token = localStorage.getItem("token");
  const token_type = localStorage.getItem("token_type");
  const response = await axios.put(
    `${API_URL}/messages/${messageId}/rating`,
    { avaliacao },
    {
      headers: {
        Authorization: `${token_type} ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};

export const getSessionsByUser = async (userId) => {
  const response = await fetch(`${API_URL}/sessions/user/${userId}/`);
  if (!response.ok) {
    throw new Error("Erro ao buscar sessões do utilizador");
  }
  return await response.json();
};

export async function updateSession(sessionId, data) {
  const token = localStorage.getItem("token");
  const token_type = localStorage.getItem("token_type");
  const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token_type} ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar sessão");
  }

  return await response.json();
}

export async function deleteSession(sessionId) {
  const token = localStorage.getItem("token");
  const token_type = localStorage.getItem("token_type");
  const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `${token_type} ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao eliminar sessão");
  }

  return true;
}

export const getSessionsByUserOrdered = async (userId) => {
  const response = await fetch(`${API_URL}/sessions/user/${userId}/ordered`);
  if (!response.ok) {
    throw new Error("Erro ao buscar sessões do utilizador ordenadas");
  }
  return await response.json();
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/uploads/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao fazer upload do ficheiro");
  }

  return await response.json();
};

export const getTemas = async () => {
  const response = await fetch("http://localhost:8000/inspect-colecao/temas");
  if (!response.ok) {
    throw new Error("Erro ao buscar os temas");
  }
  return response.json();
};

export async function updateTema(id, data) {
  const res = await fetch(`http://localhost:8000/temas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar tema");
  return res.json();
}

export async function deleteTema(id) {
  const res = await fetch(`http://localhost:8000/temas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao apagar tema");
  return res.json();
}