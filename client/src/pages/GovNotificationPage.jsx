import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertTriangle, Trash2, Radio } from 'lucide-react';
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
                // Handle pagination structure or direct array
                const notificationsData = res.data.data.notifications || (Array.isArray(res.data.data) ? res.data.data : []);
                setNotifications(notificationsData);
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
            case 'assigned': return <AlertTriangle className="text-orange-400" size={20} />;
            case 'success':
            case 'issue_resolved': return <CheckCircle className="text-green-400" size={20} />;
            case 'alert': return <AlertTriangle className="text-red-400" size={20} />;
            case 'update': return <Clock className="text-blue-400" size={20} />;
            default: return <Bell className="text-blue-400" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white p-6 pb-24 relative overflow-hidden font-sans">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Radio size={20} className="text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">System Alerts</h1>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={12} /> Purge Logs
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                            <span className="text-slate-500 text-sm font-mono animate-pulse">Fetching Encrypted Data...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 bg-[#0B1221]/50 rounded-[2rem] border border-white/5 shadow-sm">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Bell size={32} className="text-slate-600" />
                            </div>
                            <h3 className="font-bold text-white mb-1">Zero Transmissions</h3>
                            <p className="text-slate-500 text-sm">System is quiet. No new alerts.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`p-4 rounded-2xl border flex gap-4 transition-all duration-300 ${
                                        notif.read 
                                        ? 'bg-[#0B1221]/40 border-white/5 hover:bg-[#0B1221]/60' 
                                        : 'bg-blue-900/10 border-blue-500/30 hover:bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                        notif.read ? 'bg-black/20 border-white/5' : 'bg-blue-500/10 border-blue-500/20'
                                    }`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold text-sm ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap ml-2 bg-white/5 px-2 py-0.5 rounded-md">
                                                {formatDistanceToNow(new Date(notif.createdAt))}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-2 font-medium">
                                            {notif.message}
                                        </p>
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
