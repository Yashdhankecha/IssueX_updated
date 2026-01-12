import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchTimeoutRef = useRef(null);
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext
  const [serverAvailable, setServerAvailable] = useState(null);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    // Prevent multiple overlapping health checks
    if (window.serverHealthCheckPromise) {
      const health = await window.serverHealthCheckPromise;
      setServerAvailable(!!health);
      return;
    }

    try {
      window.serverHealthCheckPromise = api.checkServerHealth();
      const health = await window.serverHealthCheckPromise;
      setServerAvailable(!!health);
    } catch (error) {
      setServerAvailable(false);
    } finally {
        // Clear promise after short cache duration or immediately? 
        // Clearing it immediately allows retries, but we want to debounce mount calls.
        setTimeout(() => { window.serverHealthCheckPromise = null; }, 5000);
    }
  };

  const fetchUnreadCount = async () => {
    // Only fetch if user is authenticated and not still loading
    // Also only fetch if server is available
    if (authLoading || !user || serverAvailable === false) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error for rate limiting or network issues to avoid spam
      if (error.response?.status !== 429 && error.response?.status !== 404) {
        console.error('Failed to fetch unread count');
      }
      // Set default count when API is unavailable
      if (error.response?.status === 404 || !error.response) {
        setUnreadCount(0); // Default to 0 when service unavailable
      }
    } finally {
      setLoading(false);
    }
  };

  // No automatic fetching - triggered only by user action or page visits

  const markAsRead = async (notificationId) => {
    if (!user || serverAvailable === false) return;
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) { console.error(error); }
  };

  const markAllAsRead = async () => {
    if (!user || serverAvailable === false) return;
    try {
      const response = await api.put('/api/notifications/read-all');
      if (response.data.success) {
        setUnreadCount(0);
      }
    } catch (error) { console.error(error); }
  };

  const value = {
    unreadCount,
    setUnreadCount,
    loading,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    serverAvailable,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};