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

const adminService = { getCompanies, approveCompany, getUsers, deleteUser };
export default adminService;
