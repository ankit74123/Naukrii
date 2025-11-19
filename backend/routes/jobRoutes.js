import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobStats,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);

// Employer protected routes (must come before /:id)
router.get('/employer/my-jobs', protect, authorize('employer', 'admin'), getEmployerJobs);
router.get('/employer/stats', protect, authorize('employer', 'admin'), getJobStats);

router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

// Public route (must come after specific routes)
router.get('/:id', getJobById);

export default router;
