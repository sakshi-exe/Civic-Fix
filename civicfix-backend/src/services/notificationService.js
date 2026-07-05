const mongoose = require('mongoose');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    this.memoryNotifications = [];
  }

  isDatabaseAvailable() {
    return mongoose.connection.readyState === 1;
  }

  getMemoryNotifications(userId) {
    return this.memoryNotifications
      .filter((notification) => notification.user?.toString() === userId?.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createNotification({ user, message, type = 'system' }) {
    const payload = {
      user,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: `${Date.now()}-${this.memoryNotifications.length + 1}`,
    };

    if (!this.isDatabaseAvailable()) {
      this.memoryNotifications.push(payload);
      return payload;
    }

    try {
      return await Notification.create({ user, message, type });
    } catch (error) {
      if (error.name === 'MongoServerSelectionError' || error.message.includes('buffering timed out')) {
        this.memoryNotifications.push(payload);
        return payload;
      }
      throw error;
    }
  }

  async getNotifications(userId) {
    if (!this.isDatabaseAvailable()) {
      return this.getMemoryNotifications(userId);
    }

    try {
      return await Notification.find({ user: userId }).sort({ createdAt: -1 });
    } catch (error) {
      if (error.name === 'MongoServerSelectionError' || error.message.includes('buffering timed out')) {
        return this.getMemoryNotifications(userId);
      }
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    if (!this.isDatabaseAvailable()) {
      const notification = this.memoryNotifications.find(
        (item) => item._id?.toString() === notificationId?.toString()
      );

      if (!notification) {
        return null;
      }

      notification.isRead = true;
      return notification;
    }

    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      if (error.name === 'MongoServerSelectionError' || error.message.includes('buffering timed out')) {
        const notification = this.memoryNotifications.find(
          (item) => item._id?.toString() === notificationId?.toString()
        );
        if (notification) {
          notification.isRead = true;
          return notification;
        }
      }
      throw error;
    }
  }

  async sendStatusUpdate(user, message) {
    return this.createNotification({ user, message, type: 'status_update' });
  }
}

module.exports = new NotificationService();
