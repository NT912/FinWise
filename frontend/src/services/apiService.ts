import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.10:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// ✅ Middleware: Thêm token vào request nếu có
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Đang gửi request với token:", token);
  } else {
    console.warn("🚨 Không tìm thấy token trong AsyncStorage");
  }

  return config;
});

export default api;
