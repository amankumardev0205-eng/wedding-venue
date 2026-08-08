import express from 'express';
import { getMessages, getConversations, sendMessage, markAsRead } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/messages/:otherUserId', protect, getMessages);
router.get('/conversations', protect, getConversations);
router.post('/messages', protect, sendMessage);
router.post('/read/:otherUserId', protect, markAsRead);

export default router;
