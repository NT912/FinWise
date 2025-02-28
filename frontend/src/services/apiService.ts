import axios from "axios";

const API_URL = "http://192.168.1.10:3000/api/auth";

// Đăng ký tài khoản
export const register = async (
  fullName: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_URL}/register`, {
    fullName,
    email,
    password,
  });
  return response.data.token;
};

// Đăng nhập tài khoản
export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data.token;
};

// Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  const response = await axios.post(`${API_URL}/google`, { idToken });
  return response.data.token;
};

// Đăng nhập bằng Facebook
export const loginWithFacebook = async (idToken: string) => {
  const response = await axios.post(`${API_URL}/facebook`, { idToken });
  return response.data.token;
};
