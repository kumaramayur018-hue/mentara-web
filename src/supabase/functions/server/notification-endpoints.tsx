// Notification endpoints for Mentara
import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';

// Get user notifications
export async function getUserNotifications(c: Context) {
  try {
    const userId = c.req.param('userId');
    const allNotifications = await kv.getByPrefix('notif_');
    const userNotifications = allNotifications.filter((n: any) => n.userId === userId);
    
    // Sort by creation date (newest first)
    userNotifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ success: true, notifications: userNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ success: false, error: 'Failed to fetch notifications' }, 500);
  }
}

// Mark notification as read
export async function markNotificationRead(c: Context) {
  try {
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    
    if (!notification) {
      return c.json({ success: false, error: 'Notification not found' }, 404);
    }
    
    await kv.set(notificationId, { ...notification, read: true });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ success: false, error: 'Failed to mark notification as read' }, 500);
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(c: Context) {
  try {
    const userId = c.req.param('userId');
    const allNotifications = await kv.getByPrefix('notif_');
    const userNotifications = allNotifications.filter((n: any) => n.userId === userId && !n.read);
    
    for (const notification of userNotifications) {
      await kv.set(notification.id, { ...notification, read: true });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ success: false, error: 'Failed to mark all notifications as read' }, 500);
  }
}

// Delete notification
export async function deleteNotification(c: Context) {
  try {
    const notificationId = c.req.param('notificationId');
    await kv.del(notificationId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ success: false, error: 'Failed to delete notification' }, 500);
  }
}

// Send notification
export async function sendNotification(c: Context) {
  try {
    const { userId, type, title, message, sessionId } = await c.req.json();
    
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(notificationId, {
      id: notificationId,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId,
    });
    
    return c.json({ success: true, notificationId });
  } catch (error) {
    console.error('Error sending notification:', error);
    return c.json({ success: false, error: 'Failed to send notification' }, 500);
  }
}
