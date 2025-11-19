import api from './api';

// Get all jobs with filters
export const getAllJobs = async (params = {}) => {
  return await api.get('/jobs', { params });
};

// Get single job by ID
export const getJobById = async (id) => {
  return await api.get(`/jobs/${id}`);
};

// Create new job (employer only)
export const createJob = async (jobData) => {
  return await api.post('/jobs', jobData);
};

// Update job (employer only)
export const updateJob = async (id, jobData) => {
  return await api.put(`/jobs/${id}`, jobData);
};

// Delete job (employer only)
export const deleteJob = async (id) => {
  return await api.delete(`/jobs/${id}`);
};

// Get employer's jobs
export const getEmployerJobs = async () => {
  const response = await api.get('/jobs/employer/my-jobs');
  return response.data.data || response.data;
};

// Get employer statistics
export const getEmployerStats = async () => {
  const response = await api.get('/jobs/employer/stats');
  return response.data.data || response.data;
};

// Search jobs
export const searchJobs = async (searchTerm, filters = {}) => {
  return await api.get('/jobs', {
    params: {
      search: searchTerm,
      ...filters,
    },
  });
};
