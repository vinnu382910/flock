import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getSession = async () => {
  const response = await api.get('/auth/session');
  return response.data;
};

export const getMeters = async (search = '', page = 1) => {
  const response = await api.get(`/meters?search=${encodeURIComponent(search)}&page=${page}`);
  return response.data;
};

export const getMeterDetails = async (id) => {
  const response = await api.get(`/meters/${id}`);
  return response.data;
};

export const getMeterLocation = async (id) => {
  const response = await api.get(`/meters/${id}/location`);
  return response.data;
};

export const getMeterEnergy = async (id) => {
  const response = await api.get(`/meters/${id}/energy`);
  return response.data;
};

export const exportMeters = async () => {
  const response = await api.get('/meters/export');
  return response.data;
};

export const getTransformers = async () => {
  const response = await api.get('/transformers');
  return response.data;
};

export const getTransformerDetails = async (code) => {
  const response = await api.get(`/transformers/${code}`);
  return response.data;
};

export const getNetwork = async () => {
  const response = await api.get('/network');
  return response.data;
};

export default api;
