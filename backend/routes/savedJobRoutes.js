import express from 'express';
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved,
  updateSavedJobNotes,
} from '../controllers/savedJobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and for job seekers only
router.use(protect);
router.use(authorize('jobseeker'));

router.get('/', getSavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);
router.get('/check/:jobId', checkIfSaved);
router.put('/:jobId', updateSavedJobNotes);

export default router;
