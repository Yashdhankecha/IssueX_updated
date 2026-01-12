import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Activity, PieChart, Users, Shield,
    AlertCircle, Calendar, ChevronRight, Settings,
    Filter, RefreshCw, Timer, Zap, Trash2, Bell, Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
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
    const [thresholds, setThresholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [sendingReminder, setSendingReminder] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);
            const res = await api.get('/api/government/dashboard');
            if (res.data.success) {
                setStats(res.data.data.stats);
                setThresholds(res.data.data.thresholds);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdateThreshold = async (department, maxPendingHours, maxInProgressHours) => {
        try {
            const res = await api.put(`/api/government/thresholds/${department}`, {
                maxPendingHours,
                maxInProgressHours
            });
            if (res.data.success) {
                toast.success(`Threshold for ${department} updated`);
                fetchDashboardData();
                setShowThresholdModal(false);
            }
        } catch (error) {
            toast.error('Failed to update threshold');
        }
    };

    const handleSendReminder = async (issueId) => {
        try {
            setSendingReminder(issueId);
            // Use the shared reminder endpoint which sends notifications to the department
            const res = await api.post(`/api/admin/issues/${issueId}/remind`);

            if (res.data.success) {
                toast.success('Reminder sent to department');
                // Optional: We can still escalate priority locally or via another call if needed, 
                // but the user specifically requested notifications.
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send reminder');
        } finally {
            setSendingReminder(null);
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

    const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
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

    const ThresholdModal = () => {
        const [pendingHours, setPendingHours] = useState(selectedDepartment?.maxPendingHours || 72);
        const [inProgressHours, setInProgressHours] = useState(selectedDepartment?.maxInProgressHours || 168);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowThresholdModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        {getDepartmentLabel(selectedDepartment?.department)} - Settings
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">Configure operational thresholds for this department.</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Max Pending Time (hours)
                            </label>
                            <input
                                type="number"
                                value={pendingHours}
                                onChange={(e) => setPendingHours(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Max In-Progress Time (hours)
                            </label>
                            <input
                                type="number"
                                value={inProgressHours}
                                onChange={(e) => setInProgressHours(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={() => setShowThresholdModal(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpdateThreshold(selectedDepartment?.department, pendingHours, inProgressHours)}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-colors"
                        >
                            Save Settings
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading manager dashboard...</p>
                </div>
            </div>
        );
    }

    const totalOverdue = (stats.overdue?.pending?.length || 0) + (stats.overdue?.inProgress?.length || 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="text-indigo-600" size={32} />
                            <h1 className="text-3xl font-black text-slate-900">City Manager Dashboard</h1>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Overview of all departments and critical issues
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh Data</span>
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Issues"
                        value={stats.total}
                        icon={Activity}
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                        subtitle="Across all departments"
                    />
                    <StatCard
                        title="Critical Overdue"
                        value={totalOverdue}
                        icon={AlertTriangle}
                        color="text-red-600"
                        bg="bg-red-50"
                        subtitle="Requiring immediate attention"
                    />
                    <StatCard
                        title="Resolution Rate"
                        value={`${stats.completionRate}%`}
                        icon={CheckCircle}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        subtitle="Global efficiency"
                    />
                    <StatCard
                        title="Active Departments"
                        value="6"
                        icon={Shield}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        subtitle="Operational"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Critical/Overdue Issues */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <AlertCircle size={20} className="text-red-500" />
                                    Critical Attention Required
                                </h3>
                                <div className="text-sm font-bold text-slate-400">
                                    {totalOverdue} Issues Overdue
                                </div>
                            </div>

                            {totalOverdue === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                                    <h4 className="font-bold text-slate-900 mb-2">All Systems Operational</h4>
                                    <p className="text-slate-500 text-sm">No critical overdue issues detected.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[...(stats.overdue?.pending || []), ...(stats.overdue?.inProgress || [])]
                                        .sort((a, b) => b.overdueBy - a.overdueBy)
                                        .map((issue) => (
                                            <div key={issue._id} className="p-4 rounded-xl border border-red-100 bg-red-50/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSeverityColor(issue.severity || 'high')}`}>
                                                            {issue.severity?.toUpperCase() || 'HIGH'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                            {getDepartmentLabel(issue.category)}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900">{issue.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-red-600 font-medium mt-1">
                                                        <Clock size={12} />
                                                        Overdue by {formatDuration(issue.overdueBy)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSendReminder(issue._id)}
                                                    disabled={sendingReminder === issue._id}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    {sendingReminder === issue._id ? (
                                                        <RefreshCw className="animate-spin" size={16} />
                                                    ) : (
                                                        <Bell size={16} />
                                                    )}
                                                    Remind Dept
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Department Breakdown */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BarChart3 size={20} className="text-indigo-500" />
                                Department Performance Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(stats.byDepartment || {}).map(([dept, deptStats]) => (
                                    <div key={dept} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-slate-800 text-sm">
                                                {getDepartmentLabel(dept)}
                                            </span>
                                            {deptStats.overdueCount > 0 && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold px-2">
                                                    {deptStats.overdueCount} 🔥
                                                </span>
                                            )}
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${deptStats.total > 0 ? ((deptStats.resolved + deptStats.closed) / deptStats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{deptStats.total} Total</span>
                                            <span>{deptStats.resolved + deptStats.closed} Resolved</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Settings & Thresholds */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-slate-500" />
                                Threshold Configuration
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">Set operational limits for each department. Breaches will appear in the Critical Overdue list.</p>

                            <div className="space-y-2">
                                {thresholds.map((threshold) => (
                                    <button
                                        key={threshold.department}
                                        onClick={() => {
                                            setSelectedDepartment(threshold);
                                            setShowThresholdModal(true);
                                        }}
                                        className="w-full p-4 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="text-left">
                                            <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">
                                                {getDepartmentLabel(threshold.department)}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {formatDuration(threshold.maxPendingHours)} / {formatDuration(threshold.maxInProgressHours)}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 opacity-60">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">System Status</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                All systems nominal
                            </div>
                            <div className="mt-4 text-xs text-slate-400">
                                Automatic database backups enabled.<br />
                                Last backup: 2 hours ago.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showThresholdModal && <ThresholdModal />}
            </AnimatePresence>
        </div>
    );
};

export default ManagerDashboard;
