import api, { setAuthToken } from './api';

const STORAGE_USER_KEY = 'authUser';

const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);

  if (data.token) {
    setAuthToken(data.token);
  }

  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
  localStorage.setItem('userRole', data.role);

  return { user: data };
};

const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);

  if (data.token) {
    setAuthToken(data.token);
  }

  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));
  localStorage.setItem('userRole', data.role);

  return { user: data };
};

const logout = () => {
  setAuthToken(null);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem('userRole');
  return Promise.resolve();
};

const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_USER_KEY));
    if (user && user.token) {
      setAuthToken(user.token);
    }
    return user;
  } catch (e) {
    return null;
  }
};

const authService = { login, register, logout, getStoredUser };
export default authService;
