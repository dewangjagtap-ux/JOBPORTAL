import api from './api';

const getJobs = async () => {
  const { data } = await api.get('/jobs');
  return data;
};

const getApplications = async () => {
  const { data } = await api.get('/applications/my');
  return data;
};

const uploadResume = async (file) => {
  // Just return the file so it can be used in the apply step.
  // The actual upload happens when applying to a job in the backend model.
  return Promise.resolve(file);
};

const applyJob = async (jobId, file = null) => {
  const formData = new FormData();
  formData.append('jobId', jobId);
  if (file) {
    formData.append('resume', file);
  }

  const { data } = await api.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const getProfile = async () => {
  const { data } = await api.get('/students/profile');
  return data;
};

const updateProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    if (key === 'resume' && profileData[key] instanceof File) {
      formData.append('resume', profileData[key]);
    } else {
      formData.append(key, profileData[key]);
    }
  });

  const { data } = await api.put('/students/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const studentService = { getApplications, uploadResume, applyJob, getProfile, updateProfile, getJobs };
export default studentService;
