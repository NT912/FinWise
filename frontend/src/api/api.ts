import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth"; // Thay đổi nếu deploy lên server

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  return api.post("/register", { email, password, name });
};

export const loginUser = async (email: string, password: string) => {
  return api.post("/login", { email, password });
};

export const loginWithOAuth = async (idToken: string) => {
  return api.post("/oauth", { idToken });
};
