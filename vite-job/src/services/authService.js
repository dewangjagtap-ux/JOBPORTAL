import api, { setAuthToken } from './api';

const STORAGE_USER_KEY = 'authUser';

const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  setAuthToken(data.token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
  return { user: data };
};

const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  setAuthToken(data.token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
  return { user: data };
};

const logout = () => {
  setAuthToken(null);
  localStorage.removeItem(STORAGE_USER_KEY);
  return Promise.resolve();
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER_KEY));
  } catch (e) {
    return null;
  }
};

const authService = { login, register, logout, getStoredUser };
export default authService;
