import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Notification {
  id: string;
  userId: string;
  type: 'session_booked' | 'session_confirmed' | 'session_rescheduled' | 'session_cancelled' | 'session_reminder' | 'session_started' | 'session_completed' | 'feedback_reminder' | 'notes_added';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  sessionId?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  sendNotification: (userId: string, type: Notification['type'], title: string, message: string, sessionId?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/notifications/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [refreshNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/notifications/${user.id}/read-all`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, refreshNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [refreshNotifications]);

  // Send notification
  const sendNotification = useCallback(async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    sessionId?: string
  ) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/notifications/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            type,
            title,
            message,
            sessionId,
          }),
        }
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    if (user) {
      refreshNotifications();
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
