const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user._id);
    return successResponse(res, 'Notifications fetched successfully', { notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);

    if (!notification) {
      return errorResponse(res, 'Notification not found', ['Notification does not exist'], 404);
    }

    return successResponse(res, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};
