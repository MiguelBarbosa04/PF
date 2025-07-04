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

// services/api.js
export const loginUser = async ({ email, password }) => {
  const response = await fetch("http://localhost:8000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Erro ao autenticar");
  }

  return response.json();
};
