import express from 'express';
import {
  submitApplication,
  getApplicationsByJob,
  getMyApplications,
  getEmployerApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Job Seeker Routes
router.post('/', protect, authorize('jobseeker'), submitApplication);
router.get('/my-applications', protect, authorize('jobseeker'), getMyApplications);

// Employer Routes
router.get('/employer', protect, authorize('employer', 'admin'), getEmployerApplications);
router.get('/employer/stats', protect, authorize('employer', 'admin'), getApplicationStats);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicationsByJob);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

// Shared Routes
router.get('/:id', protect, getApplicationById);
router.delete('/:id', protect, deleteApplication);

export default router;
