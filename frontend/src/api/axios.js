import axios from 'axios';
import { toast } from 'react-hot-toast';

// Crear una instancia global de axios con baseURL
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor de respuestas para manejar expiración de token
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Limpiar localStorage y redirigir al login
      localStorage.clear();
      toast.error('Sesión expirada. Inicia sesión de nuevo');
      window.location.href = '/iniciar-sesion';
    }
    return Promise.reject(error);
  }
);

export default api;
