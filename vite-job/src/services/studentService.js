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
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.put('/students/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const applyJob = async (jobId, file = null) => {
  const formData = new FormData();
  formData.append('jobId', jobId);
  if (file) {
    formData.append('resume', file);
  }

  const { data } = await api.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const getProfile = async () => {
  const { data } = await api.get('/students/profile');
  return data;
};

const updateProfile = async (profileData) => {
  const formData = new FormData();

  // Append all profile fields to FormData
  Object.keys(profileData).forEach(key => {
    if (key === 'resume' || key === 'photo') {
      if (profileData[key] instanceof File) {
        formData.append(key, profileData[key]);
      }
    } else if (Array.isArray(profileData[key])) {
      formData.append(key, profileData[key].join(','));
    } else if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  const { data } = await api.put('/students/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const getPlacementProbability = async (studentId) => {
  const { data } = await api.get(`/ai/student/placement-probability/${studentId}`);
  return data;
};

const uploadResumeForAI = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.post('/ai/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const getResumeQuestions = async (studentId, resumeData) => {
  const encodedData = encodeURIComponent(JSON.stringify(resumeData));
  const { data } = await api.get(`/ai/interview/resume-questions/${studentId}?resumeData=${encodedData}`);
  return data;
};

const evaluateMockAnswer = async (question, answer) => {
  const { data } = await api.post('/ai/interview/mock', { question, answer });
  return data;
};

const studentService = { 
  getApplications, uploadResume, applyJob, getProfile, updateProfile, getJobs, 
  getPlacementProbability, 
  uploadResumeForAI, getResumeQuestions, evaluateMockAnswer 
};
export default studentService;
