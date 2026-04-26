import { useState, useEffect, useCallback } from 'react';
import { supabaseNotificationService } from '../services/supabaseNotificationService';
import type { Notification } from '../app/featureTypes';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await supabaseNotificationService.getNotifications(userId);
      setNotifications(data);
      
      const count = await supabaseNotificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: number) => {
    const success = await supabaseNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    const success = await supabaseNotificationService.markAllAsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, [userId]);

  const dismissNotification = useCallback(async (notificationId: number) => {
    const success = await supabaseNotificationService.dismissNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    if (userId) {
      const subscription = supabaseNotificationService.subscribeToNotifications(
        userId,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refetch: fetchNotifications,
  };
}
