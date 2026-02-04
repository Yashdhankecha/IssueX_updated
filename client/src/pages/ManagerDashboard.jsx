import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Activity, PieChart, Users, Shield,
    AlertCircle, Calendar, ChevronRight, Settings,
    Filter, RefreshCw, Timer, Zap, Trash2, Bell, Crown,
    Cpu, Database, Terminal
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
            toast.error('Data Uplink Failed');
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
                toast.success(`Protocol Updated: ${department}`);
                fetchDashboardData();
                setShowThresholdModal(false);
            }
        } catch (error) {
            toast.error('Failed to update protocol');
        }
    };

    const handleSendReminder = async (issueId) => {
        try {
            setSendingReminder(issueId);
            const res = await api.post(`/api/admin/issues/${issueId}/remind`);

            if (res.data.success) {
                toast.success('Priority Signal Sent');
                fetchDashboardData();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Signal Failed');
        } finally {
            setSendingReminder(null);
        }
    };

    const formatDuration = (hours) => {
        if (hours < 24) return `${hours}H`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}D ${remainingHours}H` : `${days}D`;
    };

    const getDepartmentLabel = (dept) => {
        const labels = {
            roads: 'ROADS',
            lighting: 'LIGHTING',
            water: 'WATER',
            cleanliness: 'SANITATION',
            safety: 'SAFETY',
            obstructions: 'OBSTRUCTIONS'
        };
        return labels[dept] || dept.toUpperCase();
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            critical: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
        };
        return colors[severity] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-[#0B1221]/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/10 relative overflow-hidden group"
        >
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-110 ${color.replace('text-', 'bg-')}`} />
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/5 ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            
            <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</h3>
            <div className="text-4xl font-black text-white mb-2 tracking-tight">{value}</div>
            
            {subtitle && <div className="text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2 uppercase tracking-wide">{subtitle}</div>}
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
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => setShowThresholdModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0B1221] rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/10 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                    <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide relative z-10">
                        {getDepartmentLabel(selectedDepartment?.department)} - Protocol
                    </h3>
                    <p className="text-slate-500 text-xs mb-8 font-mono relative z-10">Define operational limits for anomaly detection.</p>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Max Pending Time (Hours)
                            </label>
                            <input
                                type="number"
                                value={pendingHours}
                                onChange={(e) => setPendingHours(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Max Active Time (Hours)
                            </label>
                            <input
                                type="number"
                                value={inProgressHours}
                                onChange={(e) => setInProgressHours(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 relative z-10">
                        <button
                            onClick={() => setShowThresholdModal(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpdateThreshold(selectedDepartment?.department, pendingHours, inProgressHours)}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 text-xs uppercase tracking-wide border border-blue-400/20"
                        >
                            Confirm Updates
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                    <p className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">INITIALIZING MANAGER CONSOLE...</p>
                </div>
            </div>
        );
    }

    const totalOverdue = (stats.overdue?.pending?.length || 0) + (stats.overdue?.inProgress?.length || 0);

    return (
        <div className="min-h-screen bg-[#030712] p-6 pb-24 font-sans relative overflow-x-hidden">
             {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Crown className="text-blue-500" size={24} />
                             </div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Manager Console</h1>
                        </div>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">
                            City-Wide Sector Oversight // Authorized Access Only
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1221] border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wide shadow-lg"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh Data</span>
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Logs"
                        value={stats.total}
                        icon={Activity}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                        subtitle="All Sectors"
                    />
                    <StatCard
                        title="Critical Alerts"
                        value={totalOverdue}
                        icon={AlertTriangle}
                        color="text-red-400"
                        bg="bg-red-500/10"
                        subtitle="Immediate Action Req."
                    />
                    <StatCard
                        title="Efficiency"
                        value={`${Math.round(stats.completionRate)}%`}
                        icon={CheckCircle}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                        subtitle="Global Clearance Rate"
                    />
                    <StatCard
                        title="Active Units"
                        value="6"
                        icon={Shield}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                        subtitle="Online Divisions"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Critical/Overdue Issues */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/10 relative overflow-hidden">
                             {/* Red Glow for Alert Section */}
                             {totalOverdue > 0 && <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-[80px] pointer-events-none"></div>}

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={16} className={totalOverdue > 0 ? "text-red-500 animate-pulse" : "text-slate-600"} />
                                    Critical Anomalies
                                </h3>
                                <div className={`text-[10px] font-bold px-3 py-1 rounded border uppercase tracking-wider ${totalOverdue > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    {totalOverdue} Active Alerts
                                </div>
                            </div>

                            {totalOverdue === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4 opacity-50" />
                                    <h4 className="font-bold text-white mb-2 uppercase tracking-wide">Status Normal</h4>
                                    <p className="text-slate-500 text-xs font-mono">No critical deviations detected.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 relative z-10">
                                    {[...(stats.overdue?.pending || []), ...(stats.overdue?.inProgress || [])]
                                        .sort((a, b) => b.overdueBy - a.overdueBy)
                                        .map((issue) => (
                                            <div key={issue._id} className="p-5 rounded-2xl border border-red-500/20 bg-red-900/10 hover:bg-red-900/20 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(issue.severity || 'high')}`}>
                                                            {issue.severity?.toUpperCase() || 'HIGH'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                                            {getDepartmentLabel(issue.category)}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{issue.title}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-medium mt-1 font-mono uppercase">
                                                        <Clock size={12} />
                                                        Exceeded Limit: {formatDuration(issue.overdueBy)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSendReminder(issue._id)}
                                                    disabled={sendingReminder === issue._id}
                                                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap uppercase tracking-wide shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                                >
                                                    {sendingReminder === issue._id ? (
                                                        <RefreshCw className="animate-spin" size={14} />
                                                    ) : (
                                                        <Bell size={14} />
                                                    )}
                                                    Signal Priority
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Department Breakdown */}
                        <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <BarChart3 size={16} className="text-blue-500" />
                                Sector Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(stats.byDepartment || {}).map(([dept, deptStats]) => (
                                    <div key={dept} className="p-4 rounded-2xl border border-white/5 bg-[#0F172A] hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
                                                {getDepartmentLabel(dept)}
                                            </span>
                                            {deptStats.overdueCount > 0 && (
                                                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    {deptStats.overdueCount} Critical
                                                </span>
                                            )}
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden mb-3 border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${deptStats.total > 0 ? ((deptStats.resolved + deptStats.closed) / deptStats.total) * 100 : 0}%` }}
                                                className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                            <span>TOTAL: {deptStats.total}</span>
                                            <span className="text-emerald-500">RESOLVED: {deptStats.resolved + deptStats.closed}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Settings & Thresholds */}
                    <div className="space-y-8">
                        <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Settings size={16} className="text-white" />
                                System Configuration
                            </h3>
                            <p className="text-slate-500 text-xs font-mono mb-6 leading-relaxed">Adjust operational thresholds. Anomalies exceeding these parameters will trigger critical alerts.</p>

                            <div className="space-y-3">
                                {thresholds.map((threshold) => (
                                    <button
                                        key={threshold.department}
                                        onClick={() => {
                                            setSelectedDepartment(threshold);
                                            setShowThresholdModal(true);
                                        }}
                                        className="w-full p-4 rounded-xl border border-white/5 bg-[#0F172A] hover:bg-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group"
                                    >
                                        <div className="text-left">
                                            <div className="font-bold text-slate-300 text-xs uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                                                {getDepartmentLabel(threshold.department)}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 font-mono group-hover:text-slate-400">
                                                {formatDuration(threshold.maxPendingHours)} / {formatDuration(threshold.maxInProgressHours)}
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/10 opacity-80">
                            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                 <Terminal size={14} /> System Status
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide mb-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                                Operational
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono space-y-2 border-t border-white/5 pt-4">
                                <div className="flex justify-between">
                                    <span>DATABASE INTEGRITY</span>
                                    <span className="text-blue-400">100%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ENCRYPTION LEVEL</span>
                                    <span className="text-purple-400">AES-256</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>LAST LATENCY CHK</span>
                                    <span className="text-slate-300">24ms</span>
                                </div>
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
