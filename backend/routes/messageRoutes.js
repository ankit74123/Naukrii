import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Message routes
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getMessages);
router.get('/unread/count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/conversation/:userId/read', markConversationAsRead);
router.delete('/:id', deleteMessage);

export default router;
