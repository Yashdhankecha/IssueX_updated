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
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    reported: 'bg-red-500/10 text-red-600 border-red-200/50',
    in_progress: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
    resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    closed: 'bg-slate-500/10 text-slate-600 border-slate-200/50'
  };
  
  const icons = {
    reported: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle,
    closed: XCircle
  };

  const Icon = icons[status] || Shield;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${styles[status] || styles.reported}`}>
      <Icon size={12} strokeWidth={2.5} />
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="relative overflow-hidden bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl shadow-indigo-100/20 group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`} />
    
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-').replace('500', '600')}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          {trend}
        </div>
      )}
    </div>
    
    <div>
      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
    </div>
  </motion.div>
);

import { useLocation } from 'react-router-dom';

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
    if(!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      setUpdatingStatus(issueId);
      await api.patch(`/api/admin/issues/${issueId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchIssues();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
        setUpdatingStatus(null);
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('Delete this issue permanently?')) return;
    try {
      await api.delete(`/api/admin/issues/${issueId}`);
      toast.success('Deleted');
      fetchIssues();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const deleteUser = async (userId) => {
      if(!window.confirm('Delete user? This cannot be undone.')) return;
      try {
          await api.delete(`/api/admin/users/${userId}`);
          toast.success('User deleted');
          fetchUsers();
          fetchStats();
      } catch (e) {
          toast.error('Failed to delete user');
      }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
        const updates = {
            role: selectedUser.role,
            department: selectedUser.role === 'government' ? selectedUser.department : undefined,
            isActive: selectedUser.isActive
        };
        await api.patch(`/api/admin/users/${selectedUser._id}`, updates);
        toast.success('User updated successfully');
        setShowUserModal(false);
        fetchUsers();
    } catch (error) {
        toast.error('Failed to update user');
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Shield size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2">You need admin privileges to view this area.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pb-20">
        
        {/* Hero Section */}
        <div className="pt-8 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 font-medium">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </p>
            </div>
            <button 
              onClick={() => fetchStats()} 
              className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <StatCard 
                        title="Total Issues" 
                        value={stats.issues?.total || 0} 
                        icon={AlertCircle} 
                        color="bg-indigo-500"
                        trend="+12% this week"
                      />
                      <StatCard 
                        title="Active Users" 
                        value={stats.users?.active || 0} 
                        icon={Users} 
                        color="bg-violet-500"
                        trend="+5 new today" 
                      />
                      <StatCard 
                        title="Resolution Rate" 
                        value={`${Math.round(((stats.issues?.resolved || 0) / (stats.issues?.total || 1)) * 100)}%`} 
                        icon={Activity} 
                        color="bg-emerald-500" 
                      />
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl shadow-indigo-100/10">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-slate-900 rounded-full" />
                      Issue Status Breakdown
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Pending', count: stats.issues?.reported, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'In Progress', count: stats.issues?.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Resolved', count: stats.issues?.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Closed', count: stats.issues?.closed, color: 'text-slate-600', bg: 'bg-slate-100' },
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-2xl ${item.bg} border-2 border-transparent hover:border-white/50 transition-all`}>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ${item.color.replace('text-', 'text-black/50')}`}>
                            {item.label}
                          </div>
                          <div className={`text-2xl font-black ${item.color}`}>
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
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2 sticky top-[10px] z-10 backdrop-blur-md bg-white/90">
                      <div className="flex-1 relative group">
                          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input 
                              placeholder="Search issues..." 
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                          />
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                          {/* Custom Filter Dropdown */}
                          <div className="relative z-30">
                              <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm min-w-[160px] flex-1 sm:flex-none"
                              >
                                 <div className="flex items-center gap-2">
                                    <Filter size={16} />
                                    <span>
                                      {filter === 'all' ? 'Status: All' : 
                                       filter === 'reported' ? 'Pending' :
                                       filter === 'in_progress' ? 'In Progress' : 
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
                                      className="absolute left-0 origin-top-left top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden p-1.5"
                                    >
                                      {[
                                        { value: 'all', label: 'All Status', color: 'bg-slate-100' },
                                        { value: 'reported', label: 'Pending', color: 'bg-red-50 text-red-600' },
                                        { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-600' },
                                        { value: 'resolved', label: 'Resolved', color: 'bg-emerald-50 text-emerald-600' },
                                        { value: 'closed', label: 'Closed', color: 'bg-slate-50 text-slate-600' }
                                      ].map((opt) => (
                                        <button
                                          key={opt.value}
                                          onClick={() => { setFilter(opt.value); setIsFilterOpen(false); }}
                                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            filter === opt.value 
                                              ? 'bg-slate-900 text-white shadow-md' 
                                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                          }`}
                                        >
                                          <div className={`w-2 h-2 rounded-full ${filter === opt.value ? 'bg-white' : opt.color.split(' ')[0].replace('bg-', 'bg-').replace('50', '400')}`} />
                                          {opt.label}
                                          {filter === opt.value && <CheckCircle size={14} className="ml-auto" />}
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
                                className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm min-w-[160px] flex-1 sm:flex-none"
                              >
                                 <div className="flex items-center gap-2">
                                    <TrendingUp size={16} /> 
                                    <span>
                                      {categoryFilter === 'all' ? 'Category: All' : 
                                       categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
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
                                      className="absolute right-0 origin-top-right top-full mt-2 w-56 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden p-1.5"
                                    >
                                      {[
                                        { value: 'all', label: 'All Categories', color: 'bg-slate-100' },
                                        { value: 'roads', label: 'Roads', color: 'bg-orange-50 text-orange-600' },
                                        { value: 'lighting', label: 'Lights', color: 'bg-yellow-50 text-yellow-600' },
                                        { value: 'water', label: 'Water', color: 'bg-blue-50 text-blue-600' },
                                        { value: 'cleanliness', label: 'Garbage', color: 'bg-purple-50 text-purple-600' },
                                        { value: 'obstructions', label: 'Obstruction', color: 'bg-green-50 text-green-600' },
                                        { value: 'safety', label: 'Safety', color: 'bg-red-50 text-red-600' }
                                      ].map((opt) => (
                                        <button
                                          key={opt.value}
                                          onClick={() => { setCategoryFilter(opt.value); setIsCategoryOpen(false); }}
                                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            categoryFilter === opt.value 
                                              ? 'bg-slate-900 text-white shadow-md' 
                                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                          }`}
                                        >
                                          <div className={`w-2 h-2 rounded-full ${categoryFilter === opt.value ? 'bg-white' : opt.color.split(' ')[0].replace('bg-', 'bg-').replace('50', '400')}`} />
                                          {opt.label}
                                          {categoryFilter === opt.value && <CheckCircle size={14} className="ml-auto" />}
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
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {loading ? (
                          [1,2,3,4].map(i => (
                             <div key={i} className="h-48 bg-white/50 rounded-3xl animate-pulse" />
                          ))
                      ) : issues.map((issue, index) => (
                          <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              key={issue._id} 
                              onClick={() => { setSelectedIssue(issue); setShowIssueModal(true); }}
                              className="group bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden cursor-pointer"
                          >
                              {/* Status Stripe */}
                              <div className={`absolute top-0 left-0 w-full h-1 z-10 ${
                                issue.status === 'resolved' ? 'bg-emerald-500' : 
                                issue.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500' 
                              }`} />

                              {/* Delete Action - Floating Top Right */}
                              <button 
                                  onClick={(e) => { e.stopPropagation(); deleteIssue(issue._id); }} 
                                  className="absolute top-3 right-3 z-20 p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-all border border-red-100"
                                  title="Delete Issue"
                              >
                                  <Trash2 size={16} />
                              </button>

                              {/* Image Thumbnail */}
                              {issue.images && issue.images.length > 0 && (
                                <div className="h-48 w-full overflow-hidden relative">
                                  <img 
                                    src={issue.images[0]} 
                                    alt="Issue" 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                </div>
                              )}

                              <div className="p-5 flex flex-col gap-4 flex-1">
                                    <StatusBadge status={issue.status} />
                                
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-900 leading-snug text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                      {issue.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                      {issue.description}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-2 ring-white">
                                            {issue.reporter?.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">Reported By</span>
                                          <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                                              {issue.reporter?.name || 'Anonymous'}
                                          </span>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                      <ChevronRight size={16} />
                                    </button>
                                </div>
                              </div>
                          </motion.div>
                      ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center py-4 gap-2">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm"
                        >
                          Prev
                        </button>
                        <span className="text-sm font-bold text-slate-400">Page {currentPage} of {totalPages}</span>
                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm"
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
                  <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full flex gap-3">
                         <div className="relative flex-1">
                             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                             <input 
                               placeholder="Find users..." 
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                               value={userSearch}
                               onChange={e => setUserSearch(e.target.value)}
                             />
                         </div>
                         <select 
                             className="bg-slate-50 px-4 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                             value={userFilter}
                             onChange={e => setUserFilter(e.target.value)}
                         >
                             <option value="all">All Roles</option>
                             <option value="admin">Admins</option>
                             <option value="user">Users</option>
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
                             className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shrink-0 ${
                                    u.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'
                                  }`}>
                                      {u.role === 'admin' ? <Crown size={20} /> : <User size={20} />}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-lg truncate">{u.name}</h3>
                                        {u.role === 'admin' && (
                                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider rounded-md">Admin</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5 flex-wrap">
                                          <span className="truncate max-w-[150px] sm:max-w-none">{u.email}</span>
                                          <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full" />
                                          <span className="hidden sm:inline">Joined {formatDate(u.createdAt)}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2 justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50 mt-2 sm:mt-0">
                                  <button 
                                    onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors bg-slate-50 sm:bg-transparent"
                                    title="Edit User"
                                  >
                                      <RefreshCw size={18} />
                                  </button>
                                  <button 
                                    onClick={() => deleteUser(u._id)} 
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-slate-50 sm:bg-transparent"
                                    title="Delete User"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </motion.div>
                      ))}
                  </div>
                   
                  {/* User Pagination */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-center py-4 gap-2">
                        <button 
                          disabled={userCurrentPage === 1}
                          onClick={() => setUserCurrentPage(p => p - 1)}
                          className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm"
                        >
                          Prev
                        </button>
                        <span className="text-sm font-bold text-slate-400">Page {userCurrentPage} of {userTotalPages}</span>
                        <button 
                          disabled={userCurrentPage === userTotalPages}
                          onClick={() => setUserCurrentPage(p => p + 1)}
                          className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-500 disabled:opacity-50 hover:bg-slate-50 shadow-sm"
                        >
                          Next
                        </button>
                    </div>
                  )}
              </div>
          )}
        </div>
      </div>
      
      {/* View Issue Modal */}
      <AnimatePresence>
        {showIssueModal && selectedIssue && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
               onClick={() => setShowIssueModal(false)}
            >
                <motion.div 
                   initial={{ y: '100%' }} 
                   animate={{ y: 0 }} 
                   exit={{ y: '100%' }}
                   className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-[2rem] p-6 pb-32 shadow-2xl space-y-6 max-h-[85dvh] overflow-y-auto"
                   onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center">
                        <StatusBadge status={selectedIssue.status} />
                        <button onClick={() => setShowIssueModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
                    </div>

                    {/* Modal Image */}
                    {selectedIssue.images && selectedIssue.images.length > 0 && (
                      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                        <img src={selectedIssue.images[0]} alt="Issue Detail" className="w-full h-auto max-h-64 object-cover" />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedIssue.title}</h2>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                          <MapPin size={16} className="text-indigo-500" />
                          <span>{selectedIssue.location?.address || 'Location pinned on map'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                             {selectedIssue.reporter?.name?.[0] || 'U'}
                         </div>
                         <div>
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported By</div>
                             <div className="font-bold text-slate-900">{selectedIssue.reporter?.name || 'Anonymous User'}</div>
                         </div>
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed">
                        {selectedIssue.description}
                    </p>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Update Status</div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { updateIssueStatus(selectedIssue._id, 'in_progress'); setShowIssueModal(false); }}
                                className="py-3.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Clock size={16} /> In Progress
                            </button>
                            <button 
                                onClick={() => { updateIssueStatus(selectedIssue._id, 'resolved'); setShowIssueModal(false); }}
                                className="py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Mark Resolved
                            </button>
                            <button 
                                onClick={() => { updateIssueStatus(selectedIssue._id, 'closed'); setShowIssueModal(false); }}
                                className="py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle size={16} /> Close Issue
                            </button>
                            <button 
                                onClick={() => { deleteIssue(selectedIssue._id); setShowIssueModal(false); }}
                                className="py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
               onClick={() => setShowUserModal(false)}
            >
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }} 
                   exit={{ scale: 0.95, opacity: 0 }}
                   className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
                   onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
                        <button onClick={() => setShowUserModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleUserUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                            <select 
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={selectedUser.role}
                                onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="government">Government Official</option>
                            </select>
                        </div>

                        {selectedUser.role === 'government' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={selectedUser.department || ''}
                                    onChange={e => setSelectedUser({...selectedUser, department: e.target.value})}
                                    required={selectedUser.role === 'government'}
                                >
                                    <option value="">Select Department</option>
                                    <option value="roads">Roads Department</option>
                                    <option value="lighting">Lighting Department</option>
                                    <option value="water">Water Department</option>
                                    <option value="cleanliness">Sanitation (Cleanliness)</option>
                                    <option value="safety">Public Safety</option>
                                    <option value="obstructions">Obstructions</option>
                                </select>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                             <input 
                                type="checkbox" 
                                id="isActive"
                                checked={selectedUser.isActive !== false}
                                onChange={e => setSelectedUser({...selectedUser, isActive: e.target.checked})}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                             />
                             <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Account Active</label>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all mt-4"
                        >
                            Save Changes
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;