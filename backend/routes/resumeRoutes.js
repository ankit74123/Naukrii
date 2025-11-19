import express from 'express';
import {
  getMyResume,
  updateResume,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  uploadResumeDocument,
  uploadAdditionalDocument,
  deleteAdditionalDocument,
  getResumeByUserId,
  downloadResume
} from '../controllers/resumeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Resume CRUD
router.get('/', protect, authorize('jobseeker'), getMyResume);
router.put('/', protect, authorize('jobseeker'), updateResume);

// Work Experience
router.post('/work-experience', protect, authorize('jobseeker'), addWorkExperience);
router.put('/work-experience/:id', protect, authorize('jobseeker'), updateWorkExperience);
router.delete('/work-experience/:id', protect, authorize('jobseeker'), deleteWorkExperience);

// Education
router.post('/education', protect, authorize('jobseeker'), addEducation);
router.put('/education/:id', protect, authorize('jobseeker'), updateEducation);
router.delete('/education/:id', protect, authorize('jobseeker'), deleteEducation);

// File Uploads
router.post(
  '/upload',
  protect,
  authorize('jobseeker'),
  uploadSingle('resume'),
  handleUploadError,
  uploadResumeDocument
);

router.post(
  '/upload-document',
  protect,
  authorize('jobseeker'),
  uploadSingle('document'),
  handleUploadError,
  uploadAdditionalDocument
);

router.delete('/document/:id', protect, authorize('jobseeker'), deleteAdditionalDocument);

// Public/Employer access
router.get('/user/:userId', protect, authorize('employer', 'admin'), getResumeByUserId);
router.get('/download/:userId', protect, downloadResume);

export default router;
