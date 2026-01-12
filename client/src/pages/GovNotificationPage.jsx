import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

const GovNotificationPage = () => {
    const { markAllAsRead, clearAll } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/notifications');
            if (res.data.success) {
                const data = Array.isArray(res.data.data) ? res.data.data : [];
                setNotifications(data);
                markAllAsRead(); 
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get icon based on notification type
    const getIcon = (type) => {
        switch (type) {
            case 'assigned': return <AlertTriangle className="text-orange-500" size={24} />;
            case 'success': 
            case 'issue_resolved': return <CheckCircle className="text-green-500" size={24} />;
            case 'alert': return <AlertTriangle className="text-red-500" size={24} />;
            case 'update': return <Clock className="text-blue-500" size={24} />;
            default: return <Bell className="text-blue-500" size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    {notifications.length > 0 && (
                        <button 
                            onClick={clearAll} 
                            className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={12} /> Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {loading ? (
                         <div className="text-center py-10 text-slate-400">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} className="text-slate-300" />
                             </div>
                             <h3 className="font-bold text-slate-900 mb-1">No New Alerts</h3>
                             <p className="text-slate-400 text-sm">You are all caught up!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`p-4 rounded-2xl border flex gap-4 ${notif.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-slate-50' : 'bg-white shadow-sm'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notif.createdAt))} ago
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GovNotificationPage;
