import api from './api';

const resumeService = {
  // Get user's resume
  getMyResume: async () => {
    const response = await api.get('/resume');
    return response.data;
  },

  // Update resume
  updateResume: async (resumeData) => {
    const response = await api.put('/resume', resumeData);
    return response.data;
  },

  // Work Experience
  addWorkExperience: async (experienceData) => {
    const response = await api.post('/resume/work-experience', experienceData);
    return response.data;
  },

  updateWorkExperience: async (id, experienceData) => {
    const response = await api.put(`/resume/work-experience/${id}`, experienceData);
    return response.data;
  },

  deleteWorkExperience: async (id) => {
    const response = await api.delete(`/resume/work-experience/${id}`);
    return response.data;
  },

  // Education
  addEducation: async (educationData) => {
    const response = await api.post('/resume/education', educationData);
    return response.data;
  },

  updateEducation: async (id, educationData) => {
    const response = await api.put(`/resume/education/${id}`, educationData);
    return response.data;
  },

  deleteEducation: async (id) => {
    const response = await api.delete(`/resume/education/${id}`);
    return response.data;
  },

  // File Uploads
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadDocument: async (file, name) => {
    const formData = new FormData();
    formData.append('document', file);
    if (name) formData.append('name', name);
    
    const response = await api.post('/resume/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/resume/document/${id}`);
    return response.data;
  },

  // Get resume by user ID (for employers)
  getResumeByUserId: async (userId) => {
    const response = await api.get(`/resume/user/${userId}`);
    return response.data;
  },

  // Download resume
  downloadResume: async (userId) => {
    const response = await api.get(`/resume/download/${userId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default resumeService;
