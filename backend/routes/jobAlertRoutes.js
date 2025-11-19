import express from 'express';
import {
  createJobAlert,
  getJobAlerts,
  getJobAlert,
  updateJobAlert,
  deleteJobAlert,
  toggleJobAlert,
} from '../controllers/jobAlertController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and for job seekers only
router.use(protect);
router.use(authorize('jobseeker'));

router.route('/').get(getJobAlerts).post(createJobAlert);
router.route('/:id').get(getJobAlert).put(updateJobAlert).delete(deleteJobAlert);
router.put('/:id/toggle', toggleJobAlert);

export default router;
