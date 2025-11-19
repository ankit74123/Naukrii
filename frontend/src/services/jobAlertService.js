import api from './api';

// Create job alert
export const createJobAlert = async (alertData) => {
  const response = await api.post('/job-alerts', alertData);
  return response.data;
};

// Get all job alerts
export const getJobAlerts = async () => {
  const response = await api.get('/job-alerts');
  return response.data;
};

// Get single job alert
export const getJobAlert = async (id) => {
  const response = await api.get(`/job-alerts/${id}`);
  return response.data;
};

// Update job alert
export const updateJobAlert = async (id, alertData) => {
  const response = await api.put(`/job-alerts/${id}`, alertData);
  return response.data;
};

// Delete job alert
export const deleteJobAlert = async (id) => {
  const response = await api.delete(`/job-alerts/${id}`);
  return response.data;
};

// Toggle job alert active status
export const toggleJobAlert = async (id) => {
  const response = await api.put(`/job-alerts/${id}/toggle`);
  return response.data;
};

export default {
  createJobAlert,
  getJobAlerts,
  getJobAlert,
  updateJobAlert,
  deleteJobAlert,
  toggleJobAlert,
};
