import api from './api';

const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Analytics
  getAnalytics: async (period = '30') => {
    const response = await api.get('/admin/analytics', {
      params: { period }
    });
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Job Management
  getAllJobs: async (params = {}) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  updateJobStatus: async (jobId, status) => {
    const response = await api.put(`/admin/jobs/${jobId}/status`, { status });
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  }
};

export default adminService;
