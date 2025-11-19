import api from './api';

// Submit job application
export const submitApplication = async (jobId, coverLetter) => {
  const response = await api.post('/applications', { jobId, coverLetter });
  return response.data;
};

// Get my applications (job seeker)
export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data.data || response.data;
};

// Get applications for a specific job (employer)
export const getApplicationsByJob = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data.data || response.data;
};

// Get all applications for employer
export const getEmployerApplications = async () => {
  const response = await api.get('/applications/employer');
  return response.data.data || response.data;
};

// Get application by ID
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

// Update application status (employer)
export const updateApplicationStatus = async (id, status, notes) => {
  const response = await api.put(`/applications/${id}/status`, { status, notes });
  return response.data;
};

// Delete application
export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

// Get application statistics (employer)
export const getApplicationStats = async () => {
  const response = await api.get('/applications/employer/stats');
  return response.data;
};

export default {
  submitApplication,
  getMyApplications,
  getApplicationsByJob,
  getEmployerApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
};
