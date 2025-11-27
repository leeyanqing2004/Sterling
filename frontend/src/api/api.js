import axios from "axios";

// note: axios automatically parses JSON for you

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
// or replace with your constant if not using Vite

// Create an axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
});

// Automatically attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
