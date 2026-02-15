import api from './api';

const getApplicants = async () => {
  const { data } = await api.get('/applications/company');
  return data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.patch(`/applications/${applicationId}/status`, { status });
  return data;
};

const getCompanies = async () => {
  // This was used for student to view companies?
  // Original: `seedCompaniesIfEmpty` then read.
  // Backend: `GET /api/companies` is for ADMIN.
  // Is there a public companies list?
  // `jobService.getJobs` populates company info.
  // `companyService.getCompanies` usage:
  // Page `CompanyProfiles`? Page `ManageCompanies` (Admin)?

  // If finding companies to verify (Admin), use `/api/companies`.
  // If student viewing, maybe same?

  const { data } = await api.get('/companies');
  return data;
};

const getStats = async () => {
  const { data } = await api.get('/companies/stats');
  return data;
};

const getProfile = async () => {
  const { data } = await api.get('/companies/profile');
  return data;
};

const updateProfile = async (profileData) => {
  const { data } = await api.put('/companies/profile', profileData);
  return data;
};

const companyService = { getApplicants, getCompanies, updateApplicationStatus, getStats, getProfile, updateProfile };
export default companyService;
