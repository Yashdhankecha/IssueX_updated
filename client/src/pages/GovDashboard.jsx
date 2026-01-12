import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, CheckCircle, Clock, AlertTriangle, 
  TrendingUp, Activity, PieChart, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GovDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // In a real app, this should be a dedicated stats endpoint
            // For now, fetching all assigned issues and calculating
            const res = await api.get('/api/issues/assigned?status=all'); 
            if (res.data.success) {
                const issues = res.data.data;
                const total = issues.length;
                const resolved = issues.filter(i => i.status === 'resolved').length;
                const inProgress = issues.filter(i => i.status === 'in_progress').length;
                const pending = issues.filter(i => i.status === 'reported').length;
                
                setStats({
                    total,
                    resolved,
                    inProgress,
                    pending,
                    completionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
                });
            }
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, bg, subtitle }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
                 <Icon size={64} />
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-4xl font-black text-slate-900 mb-2">{value}</div>
            {subtitle && <div className="text-xs font-bold text-slate-400">{subtitle}</div>}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Welcome back, Officer {user?.name?.split(' ')[0]}
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">Department</div>
                        <div className="text-xl font-bold text-blue-600">{user?.department?.toUpperCase()}</div>
                    </div>
                </div>
                
                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Total Issues" 
                        value={stats.total} 
                        icon={Activity} 
                        color="text-blue-600" 
                        bg="bg-blue-50"
                        subtitle="Assigned to department"
                    />
                    <StatCard 
                        title="Resolved" 
                        value={stats.resolved} 
                        icon={CheckCircle} 
                        color="text-green-600" 
                        bg="bg-green-50"
                         subtitle={`${stats.completionRate}% Completion Rate`}
                    />
                     <StatCard 
                        title="In Progress" 
                        value={stats.inProgress} 
                        icon={TrendingUp} 
                        color="text-purple-600" 
                        bg="bg-purple-50"
                        subtitle="Currently active"
                    />
                    <StatCard 
                        title="Pending" 
                        value={stats.pending} 
                        icon={AlertTriangle} 
                        color="text-orange-600" 
                        bg="bg-orange-50"
                        subtitle="Needs attention"
                    />
                </div>

                {/* Progress Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Completion Ring */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[250px]">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                             <PieChart size={20} className="text-blue-500" /> Efficiency
                        </h3>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="#ecf0f1" strokeWidth="12" fill="transparent"
                                />
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="#10b981" strokeWidth="12" fill="transparent"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * stats.completionRate / 100)}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{stats.completionRate}%</span>
                                <span className="text-xs font-bold text-slate-400">RESOLVED</span>
                            </div>
                        </div>
                    </div>

                    {/* Workload Bar */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-purple-500" /> Workload Breakdown
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-500">Resolved</span>
                                    <span className="text-slate-900">{stats.resolved}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} animate={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                                        className="bg-green-500 h-full rounded-full" 
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-500">In Progress</span>
                                    <span className="text-slate-900">{stats.inProgress}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} animate={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                                        className="bg-purple-500 h-full rounded-full" 
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-500">Pending</span>
                                    <span className="text-slate-900">{stats.pending}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }} animate={{ width: `${(stats.pending / stats.total) * 100}%` }}
                                        className="bg-orange-500 h-full rounded-full" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;
