import api from './api';

const getApplicants = async (jobId = null) => {
  const endpoint = jobId ? `/applications/job/${jobId}` : '/applications/company';
  const { data } = await api.get(endpoint);
  return data;
};

const getCompanyApplications = async () => {
  return getApplicants();
};

const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.patch(`/applications/${applicationId}/status`, { status });
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
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    if (key === 'logo') {
      if (profileData[key] instanceof File) {
        formData.append('logo', profileData[key]);
      }
    } else if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  const { data } = await api.put('/companies/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const companyService = {
  getApplicants,
  getCompanyApplications,
  updateApplicationStatus,
  getStats,
  getProfile,
  updateProfile
};

export default companyService;
