import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Activity, PieChart, Users, Shield,
    AlertCircle, Calendar, ChevronRight, Settings,
    Filter, RefreshCw, Timer, Zap, Radar, Radio
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
            toast.error('Data Uplink Failed');
        } finally {
            setLoading(false);
            setRefreshing(false);
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
            safety: 'SECURITY',
            obstructions: 'OBSTRUCTIONS'
        };
        return labels[dept] || dept.toUpperCase();
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            critical: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.2)]'
        };
        return colors[severity] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, trend, onClick }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`bg-[#0B1221]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative overflow-hidden group shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
        >   
            <div className={`absolute -right-4 -top-4 p-4 opacity-10 transition-transform group-hover:scale-110 ${color}`}>
                <Icon size={80} />
            </div>
            
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/5 ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            
            <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</h3>
            <div className="text-4xl font-black text-white mb-2 tracking-tight">{value}</div>
            
            {subtitle && <div className="text-xs font-mono text-slate-400 border-t border-white/5 pt-2">{subtitle}</div>}
            
            {trend && (
                <div className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'} mt-2 flex items-center gap-1 uppercase tracking-wide`}>
                    <TrendingUp size={10} /> {trend > 0 ? '+' : ''}{trend}% VARIANCE
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
                className="bg-[#0F172A] p-4 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50"></div>
                
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${getSeverityColor(issue.severity)}`}>
                                {issue.severity?.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono border border-white/5 px-2 py-0.5 rounded bg-black/20">
                                {getDepartmentLabel(issue.category)}
                            </span>
                        </div>
                        <h4 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">{issue.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <Calendar size={10} />
                            <span>LOGGED {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                            <Timer size={12} className="animate-pulse" />
                            <span>+{formatDuration(issue.overdueBy)}</span>
                        </div>
                        <div className="text-[10px] text-red-400/60 mt-1 font-mono uppercase">LATE</div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                 <p className="text-blue-400 font-mono text-sm animate-pulse tracking-widest">ESTABLISHING SECURE CONNECTION...</p>
            </div>
        );
    }

    const totalOverdue = (stats.overdue?.pending?.length || 0) + (stats.overdue?.inProgress?.length || 0);

    return (
        <div className="min-h-screen bg-[#030712] p-6 pb-24 text-white relative font-sans overflow-x-hidden">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-blue-500 animate-pulse" size={28} />
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Command Center</h1>
                        </div>
                        <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
                            Official Clearance // {user?.name?.split(' ')[0]} // {user?.department || 'GENERAL'} DIVISION
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchDashboardData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0B1221] text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/10 transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-900/10"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh Uplink</span>
                        </button>
                    </div>
                </div>

                {/* Overdue Alert Banner */}
                {totalOverdue > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-[2rem] p-6 text-white shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                    <AlertCircle size={28} className="text-red-500 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1 text-white tracking-wide">CRITICAL ALERT: {totalOverdue} OVERDUE</h3>
                                    <p className="text-slate-400 text-sm font-mono">
                                        {stats.overdue?.pending?.length || 0} PENDING // {stats.overdue?.inProgress?.length || 0} ACTIVE EXCEEDING THRESHOLDS
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/gov-issues?filter=overdue"
                                className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 text-xs uppercase tracking-widest"
                            >
                                Investigate <ChevronRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Reports"
                        value={stats.total}
                        icon={Activity}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                        subtitle="All sector activity"
                    />
                    <StatCard
                        title="Resolved Cases"
                        value={stats.resolved}
                        icon={CheckCircle}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                        subtitle={`${Math.round(stats.completionRate)}% Clearance Rate`}
                    />
                    <StatCard
                        title="Active Operations"
                        value={stats.inProgress}
                        icon={TrendingUp}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                        subtitle="Currently deployed"
                    />
                    <StatCard
                        title="Critical Status"
                        value={totalOverdue}
                        icon={AlertTriangle}
                        color="text-red-400"
                        bg="bg-red-500/10"
                        subtitle="Immediate attention req."
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Overdue Issues List */}
                    <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Radio size={16} className="text-red-500 animate-pulse" />
                                Priority Action Items
                            </h3>
                            <Link
                                to="/gov-issues?filter=overdue"
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase tracking-wide transition-colors"
                            >
                                View Full Log <ChevronRight size={14} />
                            </Link>
                        </div>

                        {totalOverdue === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4 opacity-50" />
                                <h4 className="font-bold text-white mb-2 uppercase tracking-wide">All Systems Nominal</h4>
                                <p className="text-slate-500 text-sm font-mono">No critical delays detected in current sector.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} className="text-purple-500" />
                            Departmental Efficiency
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(stats.byDepartment || {}).map(([dept, deptStats]) => (
                            <div
                                key={dept}
                                className="p-5 rounded-2xl bg-[#0F172A] border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
                                        {getDepartmentLabel(dept)}
                                    </span>
                                    {deptStats.overdueCount > 0 && (
                                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase">
                                            {deptStats.overdueCount} Critical
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-3 font-mono text-xs">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500">TOTAL LOGS</span>
                                        <span className="font-bold text-white">{deptStats.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-orange-400">PENDING</span>
                                        <span className="font-bold text-orange-400">{deptStats.reported}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-purple-400">ACTIVE</span>
                                        <span className="font-bold text-purple-400">{deptStats.inProgress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-400">RESOLVED</span>
                                        <span className="font-bold text-emerald-400">{deptStats.resolved}</span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deptStats.total > 0 ? ((deptStats.resolved + deptStats.closed) / deptStats.total) * 100 : 0}%` }}
                                            className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right font-mono uppercase">
                                        {deptStats.total > 0 ? Math.round(((deptStats.resolved + deptStats.closed) / deptStats.total) * 100) : 0}% CLEARANCE RATE
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Severity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Severity Chart */}
                    <div className="bg-[#0B1221]/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/10">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <PieChart size={16} className="text-blue-500" /> Severity Analysis
                        </h3>
                        <div className="space-y-5">
                            {Object.entries(stats.bySeverity || {}).map(([severity, count]) => {
                                const total = Object.values(stats.bySeverity || {}).reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const colors = {
                                    low: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
                                    medium: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]',
                                    high: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]',
                                    critical: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                };

                                return (
                                    <div key={severity}>
                                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                                            <span className="text-slate-400">{severity}</span>
                                            <span className="text-white font-mono">{count} ({Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="w-full bg-[#0F172A] rounded-full h-2 overflow-hidden border border-white/5">
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
                    <div className="bg-[#0B1221]/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col items-center justify-center min-h-[300px]">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Zap size={16} className="text-emerald-500" /> Resolution Efficiency
                        </h3>
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            
                            <svg className="w-full h-full transform -rotate-90 relative z-10">
                                <circle
                                    cx="112" cy="112" r="90"
                                    stroke="#1e293b" strokeWidth="12" fill="transparent"
                                />
                                <motion.circle
                                    cx="112" cy="112" r="90"
                                    stroke="#10b981" strokeWidth="12" fill="transparent"
                                    strokeDasharray={565}
                                    initial={{ strokeDashoffset: 565 }}
                                    animate={{ strokeDashoffset: 565 - (565 * stats.completionRate / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <span className="text-5xl font-black text-white tracking-tighter">{Math.round(stats.completionRate)}%</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Efficiency</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;
