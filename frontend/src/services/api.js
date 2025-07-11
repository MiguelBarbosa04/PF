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
console.log("updateUser called", { token_type, token });
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


export const sendMessage = async (sessionId, content) => {
  const response = await axios.post(`${API_URL}/messages/`, {
    session_id: sessionId,
    content: content
  });
  return response.data;
};

// export const sendMessage = async (messageData) => {
//   const res = await fetch(`${API_URL}/messages/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//     body: JSON.stringify(messageData),
//   });
//   return res.json();
// };


export const getMessagesBySession = async (sessionId) => {
  const response = await axios.get(`${API_URL}/messages/${sessionId}`);
  return response.data;
};

export const rateMessage = async (messageId, rating) => {
  const response = await axios.post(`${API_URL}/messages/${messageId}/rating`, {
    rating: rating
  });
  return response.data;
};

export const getSessionsByUser = async (userId) => {
  const response = await fetch(`${API_URL}/sessions/user/${userId}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar sessões do utilizador");
  }
  return await response.json();
};