const test = require('node:test');
const assert = require('node:assert/strict');
const notificationService = require('../src/services/notificationService');

test('createNotification stores a notification with the expected defaults', async () => {
  const notification = await notificationService.createNotification({
    user: 'user-id',
    message: 'A report was updated',
  });

  assert.equal(notification.user.toString(), 'user-id');
  assert.equal(notification.message, 'A report was updated');
  assert.equal(notification.type, 'system');
  assert.equal(notification.isRead, false);
});
