import api from './api';

// Save a job
export const saveJob = async (jobId, notes = '') => {
  const response = await api.post(`/saved-jobs/${jobId}`, { notes });
  return response.data;
};

// Unsave a job
export const unsaveJob = async (jobId) => {
  const response = await api.delete(`/saved-jobs/${jobId}`);
  return response.data;
};

// Get all saved jobs
export const getSavedJobs = async () => {
  const response = await api.get('/saved-jobs');
  return response.data;
};

// Check if job is saved
export const checkIfSaved = async (jobId) => {
  const response = await api.get(`/saved-jobs/check/${jobId}`);
  return response.data;
};

// Update saved job notes
export const updateSavedJobNotes = async (jobId, notes) => {
  const response = await api.put(`/saved-jobs/${jobId}`, { notes });
  return response.data;
};

export default {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved,
  updateSavedJobNotes,
};
