import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Authenticate a user.
 * @param {{ email: string, password: string, role: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login({ email, password, role }) {
  const { data } = await api.post("/login", { email, password, role });
  return data;
}

/**
 * Log the current user out.
 */
export async function logout() {
  await api.post("/logout");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export default api;