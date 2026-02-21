import api from './api';

const getCompanies = async () => {
  const { data } = await api.get('/companies');
  return data;
};

const approveCompany = async (companyId) => {
  const { data } = await api.patch(`/companies/${companyId}/approve`);
  return data;
};

const getUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

const getProfile = async () => {
  const { data } = await api.get('/admin/profile');
  return data;
};

const updateProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    if (key === 'photo') {
      if (profileData[key] instanceof File) {
        formData.append('photo', profileData[key]);
      }
    } else if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  const { data } = await api.put('/admin/profile', formData);
  return data;
};

const adminService = { getCompanies, approveCompany, getUsers, deleteUser, getProfile, updateProfile };
export default adminService;
