import api from './api';

const getJobs = async (companyId = null) => {
  const query = companyId ? `?companyId=${companyId}` : '';
  const { data } = await api.get(`/jobs${query}`);
  return data;
};

const getJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

const postJob = async (jobData) => {
  const { data } = await api.post('/jobs', jobData);
  return data;
};

const deleteJob = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};

const updateJob = async (id, jobData) => {
  const { data } = await api.put(`/jobs/${id}`, jobData);
  return data;
};

const jobService = { getJobs, getJobById, postJob, deleteJob, updateJob };
export default jobService;
