import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  RefreshCw,
  Search,
  BarChart3,
  Trash2,
  Calendar,
  Filter,
  Download,
  User,
  Crown,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  X,
  ChevronRight,
  TrendingUp,
  Activity,
  Bell,
  Cpu,
  Terminal,
  Database
} from 'lucide-react';
import IssueDetailModal from '../components/IssueDetailModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const styles = {
    reported: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const icons = {
    reported: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle,
    closed: XCircle
  };

  const Icon = icons[status] || Shield;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm uppercase tracking-wider ${styles[status] || styles.reported}`}>
      <Icon size={12} strokeWidth={2.5} />
      {status.replace('_', ' ')}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="relative overflow-hidden bg-[#0B1221]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl group"
  >
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-110 ${color.replace('text-', 'bg-')}`} />

    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-wide">
          <TrendingUp size={10} />
          {trend}
        </div>
      )}
    </div>

    <div>
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Reports State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('issues');
  const [reportStatus, setReportStatus] = useState('all');
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  const generateReport = async () => {
    try {
      setIsReportGenerating(true);
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (reportType === 'issues' && reportStatus !== 'all') {
        params.append('status', reportStatus);
      }

      const response = await api.get(`/api/admin/reports?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Data Decrypted & Downloaded');
    } catch (error) {
      toast.error('Extraction Failed');
      console.error(error);
    } finally {
      setIsReportGenerating(false);
    }
  };

  // Sync activeTab with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  // Fetch Issues
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('page', currentPage);

      const response = await api.get(`/api/admin/issues?${params}`);
      if (response.data.success) {
        setIssues(response.data.data.issues);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter, searchTerm, sortBy, currentPage]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userFilter !== 'all') params.append('role', userFilter);
      if (userSearch) params.append('search', userSearch);
      params.append('page', userCurrentPage);

      const response = await api.get(`/api/admin/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setUserTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [userFilter, userSearch, userCurrentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'issues') fetchIssues();
  }, [activeTab, fetchIssues]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  const updateIssueStatus = async (issueId, newStatus) => {
    if (!window.confirm(`Initialize protocol: ${newStatus}?`)) return;
    try {
      setUpdatingStatus(issueId);
      await api.patch(`/api/admin/issues/${issueId}/status`, { status: newStatus });
      toast.success('Status Update Confirmed');
      fetchIssues();
      fetchStats();
    } catch (error) {
      toast.error('Update Failed');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('WARNING: Permanent deletion. Confirm?')) return;
    try {
      await api.delete(`/api/admin/issues/${issueId}`);
      toast.success('Record Expunged');
      fetchIssues();
      fetchStats();
    } catch (error) {
      toast.error('Deletion Failed');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Revoke user access permanently?')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('Access Revoked');
      fetchUsers();
      fetchStats();
    } catch (e) {
      toast.error('Failed to revoke access');
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updates = {
        role: selectedUser.role,
        department: ['government', 'manager', 'field_worker'].includes(selectedUser.role) ? selectedUser.department : undefined,
        isActive: selectedUser.isActive
      };
      await api.patch(`/api/admin/users/${selectedUser._id}`, updates);
      toast.success('Credentials Updated');
      setShowUserModal(false);
      fetchUsers();

    } catch (error) {
      toast.error('Update Failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-center p-6">
        <Shield size={64} className="text-red-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Access Denied</h2>
        <p className="text-slate-500 mt-2 font-mono">Insufficient Clearance Level.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans relative overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20 pt-8">

        {/* Hero Section */}
        <div className="pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                 <Terminal className="text-blue-500" />
                 ADMIN CONSOLE
              </h1>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                SYSTEM OPERATIONAL // WELCOME, {user?.name?.split(' ')[0] || 'ADMIN'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-3 bg-[#0B1221]/80 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl shadow-lg border border-white/10 transition-all active:scale-95 font-bold text-xs uppercase tracking-wide flex items-center gap-2 backdrop-blur-md"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Data</span>
              </button>
              <button
                onClick={() => fetchStats()}
                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 border border-blue-400/20 transition-all active:scale-95"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-4">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Anomalies"
                  value={stats.issues?.total || 0}
                  icon={AlertCircle}
                  color="text-blue-400"
                  trend="+12%"
                />
                <StatCard
                  title="Active Agents"
                  value={stats.users?.active || 0}
                  icon={Users}
                  color="text-purple-400"
                  trend="+5"
                />
                <StatCard
                  title="Success Rate"
                  value={`${Math.round(((stats.issues?.resolved || 0) / (stats.issues?.total || 1)) * 100)}%`}
                  icon={Activity}
                  color="text-emerald-400"
                />
              </div>

              {/* Status Breakdown */}
              <div className="bg-[#0B1221]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                 {/* scanline */}
                 <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Database size={14}/>
                  Network Status Matrix
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Pending', count: stats.issues?.reported, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'In Progress', count: stats.issues?.inProgress, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Resolved', count: stats.issues?.resolved, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Closed', count: stats.issues?.closed, color: 'text-slate-400', bg: 'bg-slate-500/10' },
                  ].map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl ${item.bg} border border-white/5 relative overflow-hidden group`}>
                       <div className={`absolute top-0 right-0 p-4 opacity-10 font-black text-4xl ${item.color.replace('text-', 'text-')}`}>#</div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70 ${item.color}`}>
                        {item.label}
                      </div>
                      <div className={`text-3xl font-black text-white`}>
                        {item.count || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ISSUES TAB */}
          {activeTab === 'issues' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Search Toolbar */}
              <div className="bg-[#0B1221]/80 p-3 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row gap-3 sticky top-[10px] z-30 backdrop-blur-md">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                  <input
                    placeholder="Initialize search sequence..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all border border-white/5"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  {/* Custom Filter Dropdown */}
                  <div className="relative z-30">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0F172A] border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm min-w-[160px] flex-1 sm:flex-none uppercase tracking-wide"
                    >
                      <div className="flex items-center gap-2">
                        <Filter size={16} />
                        <span>
                          {filter === 'all' ? 'Status: All' :
                            filter === 'reported' ? 'Pending' :
                              filter === 'in_progress' ? 'Active' :
                                filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isFilterOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="rotate-90" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isFilterOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full mt-2 w-56 bg-[#0B1221] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden p-1.5"
                          >
                            {[
                              { value: 'all', label: 'All Status', color: 'bg-slate-700' },
                              { value: 'reported', label: 'Pending', color: 'text-red-400 bg-red-500/20' },
                              { value: 'in_progress', label: 'Active', color: 'text-blue-400 bg-blue-500/20' },
                              { value: 'resolved', label: 'Resolved', color: 'text-emerald-400 bg-emerald-500/20' },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => { setFilter(opt.value); setIsFilterOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === opt.value
                                  ? 'bg-white/10 text-white'
                                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                  }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${filter === opt.value ? 'bg-white' : 'bg-slate-600'}`} />
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Custom Category Dropdown */}
                  <div className="relative z-20">
                    <button
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0F172A] border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm min-w-[160px] flex-1 sm:flex-none uppercase tracking-wide"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        <span>
                           {categoryFilter === 'all' ? 'All Types' : categoryFilter}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isCategoryOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="rotate-90" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isCategoryOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                          <motion.div
                             initial={{ opacity: 0, y: -10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: -10, scale: 0.95 }}
                             transition={{ duration: 0.2 }}
                             className="absolute right-0 top-full mt-2 w-56 bg-[#0B1221] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden p-1.5"
                          >
                             {['all', 'roads', 'lighting', 'water', 'cleanliness', 'obstructions', 'safety'].map((opt) => (
                                <button
                                   key={opt}
                                   onClick={() => { setCategoryFilter(opt); setIsCategoryOpen(false); }}
                                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${categoryFilter === opt
                                      ? 'bg-white/10 text-white'
                                      : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                      }`}
                                >
                                   {opt}
                                </button>
                             ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Issues Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-[#0B1221] rounded-3xl animate-pulse border border-white/5" />
                  ))
                ) : issues.map((issue, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    key={issue._id}
                    onClick={() => { setSelectedIssue(issue); setShowIssueModal(true); }}
                    className="group bg-[#0B1221]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg hover:shadow-2xl hover:border-white/20 hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden cursor-pointer"
                  >
                    {/* Status Stripe */}
                    <div className={`absolute top-0 left-0 w-full h-1 z-10 ${issue.status === 'resolved' ? 'bg-emerald-500' :
                      issue.status === 'in_progress' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />

                    {/* Delete Action - Floating Top Right */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteIssue(issue._id); }}
                      className="absolute top-3 right-3 z-20 p-2 bg-black/50 backdrop-blur text-red-400 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all border border-white/10"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Image Thumbnail */}
                    {issue.images && issue.images.length > 0 ? (
                      <div className="h-48 w-full overflow-hidden relative">
                        <img
                          src={issue.images[0]}
                          alt="Issue"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] to-transparent opacity-90" />
                      </div>
                    ) : (
                       <div className="h-48 w-full bg-[#0F172A] flex items-center justify-center text-slate-700">
                          <AlertCircle size={32} />
                       </div>
                    )}

                    <div className="p-6 flex flex-col gap-4 flex-1 -mt-12 relative z-10">
                      <div>
                         <StatusBadge status={issue.status} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-white leading-tight text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-light">
                          {issue.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-white/10">
                            {issue.anonymous ? '?' : (issue.reportedBy?.name?.[0] || 'U')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Operative</span>
                            <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                {issue.anonymous ? 'ANONYMOUS' : (issue.reportedBy?.name || 'Unknown')}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 bg-white/5 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 bg-[#0B1221] border border-white/10 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50 hover:bg-white/5 hover:text-white uppercase tracking-wide"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-slate-500 font-mono">PAGE {currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 bg-[#0B1221] border border-white/10 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50 hover:bg-white/5 hover:text-white uppercase tracking-wide"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* User Toolbar */}
              <div className="bg-[#0B1221]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                      placeholder="Search personnel database..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 border border-white/5"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="bg-[#0F172A] px-4 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 border border-white/5 uppercase tracking-wide"
                    value={userFilter}
                    onChange={e => setUserFilter(e.target.value)}
                  >
                    <option value="all">All Ranks</option>
                    <option value="admin">Command</option>
                    <option value="user">Operatives</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              <div className="grid gap-3">
                {users.map((u, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={u._id}
                    className="group bg-[#0B1221] p-4 rounded-2xl border border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0 border border-white/10 ${u.role === 'admin' ? 'bg-purple-900/20 text-purple-400' : 'bg-slate-800/50 text-slate-400'
                        }`}>
                        {u.role === 'admin' ? <Crown size={20} /> : <User size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">{u.name}</h3>
                          {u.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider rounded">Admin</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 mt-1 flex-wrap font-mono uppercase">
                          <span className="truncate max-w-[150px] sm:max-w-none">{u.email}</span>
                          <span className="hidden sm:inline w-1 h-1 bg-slate-700 rounded-full" />
                          <span className="hidden sm:inline">ID: {u._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-3 sm:pt-0 border-t border-white/5 sm:border-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Modify Credentials"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Revoke Access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

               {/* User Pagination */}
               {userTotalPages > 1 && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <button
                    disabled={userCurrentPage === 1}
                    onClick={() => setUserCurrentPage(p => p - 1)}
                    className="px-4 py-2 bg-[#0B1221] border border-white/10 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50 hover:bg-white/5 hover:text-white uppercase tracking-wide"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-slate-500 font-mono">PAGE {userCurrentPage} / {userTotalPages}</span>
                  <button
                    disabled={userCurrentPage === userTotalPages}
                    onClick={() => setUserCurrentPage(p => p + 1)}
                    className="px-4 py-2 bg-[#0B1221] border border-white/10 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50 hover:bg-white/5 hover:text-white uppercase tracking-wide"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Generation Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1221] w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/10 text-center space-y-6 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <div className="w-16 h-16 bg-blue-900/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Download size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Export Data Log</h2>
                <p className="text-slate-500 text-sm font-mono">Decrypt and download sector metrics.</p>
              </div>

              <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 text-left space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setReportType('issues')}
                      className={`p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border ${reportType === 'issues'
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                        : 'border-white/5 bg-black/20 text-slate-500 hover:bg-white/5'
                        }`}
                    >
                      Issue Anomalies
                    </button>
                    <button
                      onClick={() => setReportType('users')}
                       className={`p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border ${reportType === 'users'
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                        : 'border-white/5 bg-black/20 text-slate-500 hover:bg-white/5'
                        }`}
                    >
                      Operative Roster
                    </button>
                  </div>
                </div>
                
                {reportType === 'issues' && (
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Filter Status</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-blue-500"
                            value={reportStatus}
                            onChange={(e) => setReportStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="reported">Pending Only</option>
                            <option value="in_progress">Active Only</option>
                            <option value="resolved">Resolved Only</option>
                        </select>
                     </div>
                )}
              </div>

               <button
                  onClick={generateReport}
                  disabled={isReportGenerating}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
                >
                  {isReportGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Processing...
                      </>
                  ) : (
                      <>
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform"/> Initialize Download
                      </>
                  )}
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Detail Modal */}
      {showIssueModal && selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => { setShowIssueModal(false); setSelectedIssue(null); }}
        />
      )}

      {/* User Edit Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1221] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <UserCheck className="text-blue-400" size={24} />
                  Edit Clearance
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Operative Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    disabled
                    className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-3 text-slate-400 text-sm font-medium focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rank / Role</label>
                  <div className="relative">
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="government">Government</option>
                      <option value="field_worker">Field Worker</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {['government', 'manager', 'field_worker'].includes(selectedUser.role) && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Department</label>
                    <div className="relative">
                      <select
                        value={selectedUser.department || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                      >
                        <option value="">Select Department</option>
                        <option value="Roads">Roads</option>
                        <option value="Water">Water</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="Public Safety">Public Safety</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-[#0F172A] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedUser.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {selectedUser.isActive ? <Unlock size={18} /> : <Lock size={18} />}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Account Status</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {selectedUser.isActive ? 'ACTIVE ACCESS' : 'LOCKED'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, isActive: !selectedUser.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${selectedUser.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedUser.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-3 bg-[#0F172A] text-slate-400 font-bold rounded-xl hover:bg-white/5 hover:text-white transition-all uppercase tracking-wide text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wide text-xs"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;