import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Clock, 
  MapPin, 
  MessageSquare, 
  ThumbsUp,
  Check,
  Filter,
  Inbox
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const { user } = useAuth();
  const { markAsRead, markAllAsRead, setUnreadCount } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread'
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // We fetch "all" and filter locally for smoother UI or fetch per tab. 
      // For now, let's fetch 'all' mostly.
      const params = new URLSearchParams({
        filter: 'all', // Fetch all initially to allow local tab switching if list is small
        page: 1,
        limit: 50
      });
      
      const response = await api.get(`/api/notifications?${params}`);
      if (response.data.success) {
        const notifs = response.data.data.notifications;
        setNotifications(notifs);
        
        // Update global unread count
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Local filtering based on tabs
    if (activeTab === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.read));
    } else {
      setFilteredNotifications(notifications);
    }
  }, [notifications, activeTab]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update all');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
        await api.delete(`/api/notifications/${notificationId}`);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success('Removed');
    } catch (error) {
        toast.error('Failed to delete');
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      case 'vote': return 'bg-emerald-100 text-emerald-600';
      case 'update': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle size={20} />;
      case 'comment': return <MessageSquare size={20} />;
      case 'vote': return <ThumbsUp size={20} />;
      case 'update': return <CheckCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity</h1>
            <p className="text-slate-500 mt-1">Updates on your reports and community</p>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
                <button
                onClick={handleMarkAllAsRead}
                className="flex items-center px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                <Check size={16} className="mr-2" />
                Mark all read
                </button>
            )}
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                 <Bell size={20} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 mb-6 w-fit">
            {['all', 'unread'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* Content */}
        {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
                ))}
             </div>
        ) : filteredNotifications.length > 0 ? (
            <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`group relative overflow-hidden bg-white hover:bg-slate-50 rounded-2xl p-5 transition-all duration-200 ${
                                !notification.read ? 'shadow-md border border-blue-100 ring-1 ring-blue-500/10' : 'shadow-sm border border-slate-100'
                            }`}
                        >
                            {/* Unread Indicator */}
                            {!notification.read && (
                                <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon Bubble */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${getIconStyles(notification.type || notification.icon)} shadow-sm`}>
                                    {getIcon(notification.type || notification.icon)}
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <h3 className={`text-base font-bold text-slate-900 leading-tight ${!notification.read ? 'text-blue-900' : ''}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-400 flex-shrink-0 ml-2 whitespace-nowrap">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                        {notification.message}
                                    </p>
                                    
                                    {/* Footer Meta */}
                                    <div className="flex items-center gap-4">
                                        {notification.location && (
                                            <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                <MapPin size={10} className="mr-1" />
                                                {notification.location}
                                            </span>
                                        )}
                                        
                                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                                                    title="Mark read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Inbox size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {activeTab === 'unread' ? 'All caught up' : 'No notifications yet'}
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                    {activeTab === 'unread' 
                        ? "You have no unread notifications. Great job appearing on top of things!" 
                        : "When there's activity on your reports or in your area, it'll show up here."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage; 