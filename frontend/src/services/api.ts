import axios from 'axios';

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },

  timeout: 15000,
});

// ======================================================
// ATTACH JWT TO AUTHENTICATED REQUESTS
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopkart_token');

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
