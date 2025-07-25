import api from './axios';

const API_URL = 'http://localhost:8000/api/productos/';

export const getProducts = async () => {
  const response = await api.get(API_URL);
  return response.data;
};
