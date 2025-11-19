import express from 'express';
import {
  getUserProfile,
  updateProfile,
  deleteAccount,
  getAllUsers,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadAvatar,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

// Avatar upload route
router.post(
  '/profile/avatar',
  protect,
  uploadSingle('profilePicture'),
  handleUploadError,
  uploadAvatar
);

// Experience routes
router.post('/profile/experience', protect, addExperience);
router.delete('/profile/experience/:exp_id', protect, deleteExperience);

// Education routes
router.post('/profile/education', protect, addEducation);
router.delete('/profile/education/:edu_id', protect, deleteEducation);

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);

export default router;
