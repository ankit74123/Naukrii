import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getNotifications);

router.route('/unread-count').get(getUnreadCount);

router.route('/mark-all-read').put(markAllAsRead);

router.route('/clear-read').delete(clearReadNotifications);

router.route('/:id').get(getNotification).delete(deleteNotification);

router.route('/:id/read').put(markAsRead);

export default router;
