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
  Inbox,
  AlertTriangle,
  Radio
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
      const params = new URLSearchParams({
        filter: 'all', 
        page: 1,
        limit: 50
      });
      
      const response = await api.get(`/api/notifications?${params}`);
      if (response.data.success) {
        const notifs = response.data.data.notifications;
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load encrypted feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
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
    } catch (error) {
      // silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All channels cleared');
    } catch (error) {
      toast.error('Failed to clear channel');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
        await api.delete(`/api/notifications/${notificationId}`);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success('Transmission deleted');
    } catch (error) {
        toast.error('Failed to delete');
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'comment': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'vote': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'update': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-white/10';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={20} />;
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
    
    if (diffInSeconds < 60) return 'NOW';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#030712] pb-12 w-full max-w-[100vw] overflow-x-hidden font-sans relative">
      
       {/* Ambient Background */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10 pt-20">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
               <Radio className="text-blue-500 animate-pulse" /> 
               COMMs FEED
            </h1>
            <p className="text-slate-500 mt-1 font-mono text-sm uppercase tracking-wide">Encrypted Platform Activity Log</p>
          </div>
          
          <div className="flex items-center gap-3">
            {notifications.some(n => !n.read) && (
                <button
                onClick={handleMarkAllAsRead}
                className="flex items-center px-4 py-2 bg-[#0B1221] border border-blue-500/30 shadow-lg shadow-blue-900/20 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-900/20 transition-colors uppercase tracking-wide"
                >
                <Check size={14} className="mr-2" />
                ACKNOWLEDGE ALL
                </button>
            )}
             <div className="w-10 h-10 bg-[#0B1221] rounded-xl shadow-sm border border-white/10 flex items-center justify-center relative">
                 <Bell size={20} className="text-slate-400" />
                 {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                 )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-[#0B1221]/80 backdrop-blur-md rounded-xl border border-white/5 mb-8 w-fit">
            {['all', 'unread'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-[#0B1221] rounded-2xl border border-white/5 animate-pulse"></div>
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
                            className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 border ${
                                !notification.read 
                                ? 'bg-[#0F172A] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                : 'bg-[#0B1221]/60 border-white/5 hover:bg-[#0B1221]'
                            }`}
                        >
                            {/* Unread Indicator Glow */}
                            {!notification.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                            )}

                            <div className="flex items-start gap-5">
                                {/* Icon Bubble */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${getIconStyles(notification.type || notification.icon)}`}>
                                    {getIcon(notification.type || notification.icon)}
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <h3 className={`text-sm font-bold leading-tight ${!notification.read ? 'text-white' : 'text-slate-400'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-500 font-mono flex-shrink-0 ml-2 whitespace-nowrap bg-white/5 px-2 py-0.5 rounded">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4 group-hover:text-slate-300 transition-colors">
                                        {notification.message}
                                    </p>
                                    
                                    {/* Footer Meta */}
                                    <div className="flex items-center gap-4">
                                        {notification.location && (
                                            <span className="inline-flex items-center text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wide">
                                                <MapPin size={10} className="mr-1" />
                                                {notification.location}
                                            </span>
                                        )}
                                        
                                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                                    title="Ack"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                title="Purge"
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
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Inbox size={32} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                    {activeTab === 'unread' ? 'All Clear' : 'Silence on Feed'}
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                    {activeTab === 'unread' 
                        ? "Zero unacknowledged transmissions. Stand by for updates." 
                        : "No activity logs detected in the recent timeframe."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;