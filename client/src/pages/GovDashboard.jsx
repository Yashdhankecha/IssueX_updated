import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Activity, PieChart, Users, Shield,
    AlertCircle, Calendar, ChevronRight, Settings,
    Filter, RefreshCw, Timer, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GovDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
        closed: 0,
        completionRate: 0,
        overdue: {
            pending: [],
            inProgress: []
        },
        byDepartment: {},
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);
            const res = await api.get('/api/government/dashboard');
            if (res.data.success) {
                setStats(res.data.data.stats);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatDuration = (hours) => {
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    };

    const getDepartmentLabel = (dept) => {
        const labels = {
            roads: '🛣️ Roads',
            lighting: '💡 Lighting',
            water: '💧 Water',
            cleanliness: '🧹 Cleanliness',
            safety: '🛡️ Safety',
            obstructions: '🚧 Obstructions'
        };
        return labels[dept] || dept;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'text-green-600 bg-green-50',
            medium: 'text-yellow-600 bg-yellow-50',
            high: 'text-orange-600 bg-orange-50',
            critical: 'text-red-600 bg-red-50'
        };
        return colors[severity] || 'text-slate-600 bg-slate-50';
    };

    const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, trend, onClick }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
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
            {trend && (
                <div className={`text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'} mt-2 flex items-center gap-1`}>
                    <TrendingUp size={12} /> {trend > 0 ? '+' : ''}{trend}% from last week
                </div>
            )}
        </motion.div>
    );

    const OverdueCard = ({ issue }) => (
        <Link to={`/gov-issues?filter=overdue&id=${issue._id}`}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="bg-white p-4 rounded-2xl border border-red-100 hover:border-red-200 transition-all cursor-pointer"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSeverityColor(issue.severity)}`}>
                                {issue.severity?.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">{getDepartmentLabel(issue.category)}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{issue.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={12} />
                            <span>Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                            <Timer size={14} />
                            <span>+{formatDuration(issue.overdueBy)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">overdue</div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const totalOverdue = (stats.overdue?.pending?.length || 0) + (stats.overdue?.inProgress?.length || 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="text-blue-600" size={28} />
                            <h1 className="text-3xl font-black text-slate-900">Government Dashboard</h1>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Welcome back, Officer {user?.name?.split(' ')[0]}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchDashboardData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        
                    </div>
                </div>

                {/* Overdue Alert Banner */}
                {totalOverdue > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-[2rem] p-6 text-white shadow-lg"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <AlertCircle size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1">⚠️ {totalOverdue} Overdue Issues</h3>
                                    <p className="text-white/80 text-sm">
                                        {stats.overdue?.pending?.length || 0} pending, {stats.overdue?.inProgress?.length || 0} in-progress exceeding thresholds
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/gov-issues?filter=overdue"
                                className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
                            >
                                View All <ChevronRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Issues"
                        value={stats.total}
                        icon={Activity}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        subtitle="All department issues"
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
                        title="Overdue"
                        value={totalOverdue}
                        icon={AlertTriangle}
                        color="text-red-600"
                        bg="bg-red-50"
                        subtitle="Exceeding thresholds"
                    />
                </div>

                {/* Two Column Layout - Simplified removing thresholds */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Overdue Issues List */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-500" />
                                Critical Overdue Issues
                            </h3>
                            <Link
                                to="/gov-issues?filter=overdue"
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        {totalOverdue === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="font-bold text-slate-900 mb-2">All Caught Up!</h4>
                                <p className="text-slate-500 text-sm">No overdue issues at the moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[...(stats.overdue?.pending || []), ...(stats.overdue?.inProgress || [])]
                                    .sort((a, b) => b.overdueBy - a.overdueBy)
                                    .slice(0, 9)
                                    .map((issue, index) => (
                                        <OverdueCard key={issue._id || index} issue={issue} />
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* Department-wise Stats */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 size={20} className="text-purple-500" />
                            Department Performance
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats.byDepartment || {}).map(([dept, deptStats]) => (
                            <div
                                key={dept}
                                className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-slate-800">
                                        {getDepartmentLabel(dept)}
                                    </span>
                                    {deptStats.overdueCount > 0 && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                                            {deptStats.overdueCount} overdue
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Total</span>
                                        <span className="font-bold text-slate-800">{deptStats.total}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-orange-500">Pending</span>
                                        <span className="font-bold text-orange-600">{deptStats.reported}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-purple-500">In Progress</span>
                                        <span className="font-bold text-purple-600">{deptStats.inProgress}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-green-500">Resolved</span>
                                        <span className="font-bold text-green-600">{deptStats.resolved}</span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deptStats.total > 0 ? ((deptStats.resolved + deptStats.closed) / deptStats.total) * 100 : 0}%` }}
                                            className="bg-green-500 h-full rounded-full"
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 text-right">
                                        {deptStats.total > 0 ? Math.round(((deptStats.resolved + deptStats.closed) / deptStats.total) * 100) : 0}% resolved
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Severity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Severity Chart */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <PieChart size={20} className="text-blue-500" /> Severity Distribution
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.bySeverity || {}).map(([severity, count]) => {
                                const total = Object.values(stats.bySeverity || {}).reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const colors = {
                                    low: 'bg-green-500',
                                    medium: 'bg-yellow-500',
                                    high: 'bg-orange-500',
                                    critical: 'bg-red-500'
                                };

                                return (
                                    <div key={severity}>
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span className="text-slate-600 capitalize">{severity}</span>
                                            <span className="text-slate-900">{count} ({Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`${colors[severity]} h-full rounded-full`}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Completion Ring */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" /> Overall Efficiency
                        </h3>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96" cy="96" r="85"
                                    stroke="#ecf0f1" strokeWidth="14" fill="transparent"
                                />
                                <motion.circle
                                    cx="96" cy="96" r="85"
                                    stroke="#10b981" strokeWidth="14" fill="transparent"
                                    strokeDasharray={534}
                                    initial={{ strokeDashoffset: 534 }}
                                    animate={{ strokeDashoffset: 534 - (534 * stats.completionRate / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900">{stats.completionRate}%</span>
                                <span className="text-sm font-bold text-slate-400">RESOLVED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;
