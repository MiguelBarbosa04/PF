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