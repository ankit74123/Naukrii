import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
  const { type, isRead, page = 1, limit = 20 } = req.query;

  const query = { recipient: req.user.id };

  // Filter by type if provided
  if (type) {
    query.type = type;
  }

  // Filter by read status if provided
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .populate('sender', 'name avatar')
    .populate('relatedJob', 'title company')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: notifications,
  });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'name avatar')
      .populate('relatedJob', 'title company location')
      .populate('relatedApplication', 'status');

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    // Make sure user is notification recipient
    if (notification.recipient.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this notification', 403));
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    // Make sure user is notification recipient
    if (notification.recipient.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this notification', 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    // Make sure user is notification recipient
    if (notification.recipient.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this notification', 403));
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user.id,
      isRead: true,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications cleared`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (helper function)
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
