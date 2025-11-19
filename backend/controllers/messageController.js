import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { ErrorResponse } from '../middleware/error.js';
import { createNotification } from './notificationController.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, applicationId, jobId } = req.body;

    if (!receiverId || !content) {
      return next(new ErrorResponse('Please provide receiver and message content', 400));
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return next(new ErrorResponse('Receiver not found', 404));
    }

    // Create conversationId
    const ids = [req.user.id, receiverId].sort();
    const conversationId = ids.join('_');

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      application: applicationId,
      job: jobId,
      conversationId,
    });

    await message.populate([
      { path: 'sender', select: 'name avatar role companyName' },
      { path: 'receiver', select: 'name avatar role companyName' },
    ]);

    // Create notification for receiver
    await createNotification({
      recipient: receiverId,
      sender: req.user.id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name} sent you a message`,
      link: `/messages?conversationId=${conversationId}`,
      relatedMessage: message._id,
      priority: 'normal',
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for logged in user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all unique conversation partners
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userObjectId] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Populate user details
    const conversations = await Message.populate(messages, {
      path: 'lastMessage.sender lastMessage.receiver',
      select: 'name avatar role companyName',
    });

    // Format the response
    const formattedConversations = conversations.map((conv) => {
      const otherUser =
        conv.lastMessage.sender._id.toString() === userId
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

      return {
        conversationId: conv._id,
        user: otherUser,
        lastMessage: {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isRead: conv.lastMessage.isRead,
          senderId: conv.lastMessage.sender._id,
        },
        unreadCount: conv.unreadCount,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Create conversationId
    const ids = [currentUserId, userId].sort();
    const conversationId = ids.join('_');

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role companyName')
      .populate('receiver', 'name avatar role companyName')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to mark this message as read', 401));
    }

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all messages in conversation as read
// @route   PUT /api/messages/conversation/:userId/read
// @access  Private
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Create conversationId
    const ids = [currentUserId, userId].sort();
    const conversationId = ids.join('_');

    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: Date.now(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this message', 401));
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
