import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Calendar, MapPin, Activity, Shield, Award, Clock,
  CheckCircle, AlertCircle, Plus, Edit, Settings, Sparkles, TrendingUp,
  Heart, Camera, ArrowRight, X, LogOut, Share2, MoreHorizontal,
  ThumbsUp, ThumbsDown, ArrowBigUp, ArrowBigDown, Hash, Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIssue } from '../contexts/IssueContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, updateUser, logout, getMyVotes } = useAuth();
  const { getUserIssues } = useIssue();
  const navigate = useNavigate();

  const [userIssues, setUserIssues] = useState([]);
  const [votedIssues, setVotedIssues] = useState({ upvotedIssues: [], downvotedIssues: [], totalUpvotes: 0, totalDownvotes: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issues');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [issues, votes] = await Promise.all([
          getUserIssues(),
          getMyVotes()
        ]);
        setUserIssues(issues);
        setVotedIssues(votes);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserData();
  }, [user, getUserIssues, getMyVotes]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds protocol limit (5MB)', { style: { background: '#1e293b', color: '#fff' } });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await api.put('/api/auth/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('ID Biometrics Updated', { icon: '🧬', style: { background: '#1e293b', color: '#fff' } });
        if (updateUser) updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Upload Failed', { style: { background: '#1e293b', color: '#fff' } });
    } finally {
      setUploadingImage(false);
      setShowImageUpload(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await api.delete('/api/auth/profile/picture');
      if (response.data.success) {
        toast.success('Biometrics Cleared', { style: { background: '#1e293b', color: '#fff' } });
        if (updateUser) updateUser(response.data.user);
      }
    } catch (error) {
      toast.error('Failed to remove picture');
    }
  };

  const getStats = () => {
     const total = userIssues.length;
     const resolved = userIssues.filter(i => i.status === 'resolved').length;
     const impactScore = user?.impactScore || 0;
     return { total, resolved, impactScore };

  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#030712] text-white relative pb-20 font-sans overflow-hidden">

      {/* --- Abstract Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 md:pt-20">

        {/* --- Profile Header Card --- */}
        <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden mb-8 group">
          {/* Banner with Logout */}
          <div className="relative h-48 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-b border-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             {/* Tech Grid Overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <button
              onClick={logout}
              className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Terminate Session
            </button>
          </div>

          {/* Profile Content */}
          <div className="px-6 md:px-12 pb-10">
            <div className="flex flex-col md:flex-row gap-8 relative">
              {/* Avatar - Floating partially over banner */}
              <div className="relative -mt-20 shrink-0 flex justify-center md:justify-start">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-4 border-[#0B1221] shadow-2xl overflow-hidden bg-[#0F172A] relative z-10 group-hover:scale-[1.02] transition-transform duration-500">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                      <User size={48} />
                    </div>
                  )}
                  {/* Edit Overlay */}
                  <div
                    onClick={() => setShowImageUpload(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20 backdrop-blur-sm"
                  >
                    <Camera className="text-white" />
                  </div>
                </div>
                {/* Verified Badge */}
                <div className="absolute bottom-2 right-0 md:right-auto md:left-36 w-8 h-8 bg-green-500 border-4 border-[#0B1221] rounded-full flex items-center justify-center text-white z-20 shadow-lg glow-green">
                  <CheckCircle size={14} fill="currentColor" className="text-green-500 bg-white rounded-full" />
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 pt-2 md:pt-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        {user?.name || 'Unknown Operative'}
                    </h1>
                    <p className="text-slate-400 font-mono text-sm flex items-center justify-center md:justify-start gap-2 mb-6 uppercase tracking-wider">
                      <Hash size={12} className="text-blue-500" /> ID: {user?.voteHistory?.length || '00'}-{Math.floor(Math.random() * 9000) + 1000}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        <span className="font-bold text-yellow-100">{stats.impactScore}</span>
                        <span className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-wide">Reputation</span>
                      </div>
                      <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-300">Active Since {new Date(user?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/settings" className="self-center md:self-start px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2 group">
                    <Settings size={18} className="group-hover:rotate-90 transition-transform"/> Protocols
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-12">
          <div className="bg-[#0B1221]/80 backdrop-blur-sm p-6 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="text-3xl md:text-4xl font-black text-white mb-1 relative z-10">{stats.total}</div>
            <div className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest relative z-10">Transmissions</div>
          </div>
          <div className="bg-[#0B1221]/80 backdrop-blur-sm p-6 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
            <div className="text-3xl md:text-4xl font-black text-white mb-1 relative z-10">{stats.resolved}</div>
            <div className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-widest relative z-10">Resolved</div>
          </div>
          <div className="bg-[#0B1221]/80 backdrop-blur-sm p-6 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="text-3xl md:text-4xl font-black text-white mb-1 relative z-10">Elite</div>
            <div className="text-[10px] md:text-xs font-bold text-purple-400 uppercase tracking-widest relative z-10">Clearance</div>
          </div>
        </div>

        {/* --- Content Tabs --- */}
        <div className="flex items-center gap-8 border-b border-white/10 mb-8 px-4 overflow-x-auto scrollbar-hide">
          {['issues', 'votes', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-colors relative whitespace-nowrap tracking-wide ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'issues' ? 'Mission Logs' : tab === 'votes' ? (
                <span className="flex items-center gap-2">
                  Consensus Data
                  {(votedIssues.totalUpvotes + votedIssues.totalDownvotes) > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px]">
                      {votedIssues.totalUpvotes + votedIssues.totalDownvotes}
                    </span>
                  )}
                </span>
              ) : 'System Activity'}
              {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />}
            </button>
          ))}
        </div>

        {/* --- List Content --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'issues' ? (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {loading ? (
                 <div className="flex flex-col items-center py-20">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                    <span className="text-slate-500 text-sm font-mono animate-pulse">Decrypting Logs...</span>
                </div>
              ) : userIssues.length > 0 ? (
                userIssues.map(issue => (
                  <Link to={`/issue/${issue._id || issue.id}`} key={issue._id || issue.id} className="block group">
                    <div className="bg-[#0B1221]/60 p-3 sm:p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-[#0B1221] transition-all flex gap-4 items-start sm:items-center relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 mt-1 sm:mt-0 border border-white/5">
                        {issue.images?.[0] ? (
                          <img src={issue.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600"><MapPin size={24} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                issue.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                issue.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                 issue.status === 'resolved' ? 'bg-green-400' : 
                                 issue.status === 'in_progress' ? 'bg-yellow-400' : 
                                 'bg-red-400'
                            } animate-pulse`} />
                            {issue.status.replace('_', ' ')}
                          </div>
                          
                          <span className="text-[10px] sm:text-xs text-slate-500 font-mono">{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                        </div>
                        <h3 className="font-bold text-white line-clamp-1 sm:line-clamp-2 text-base sm:text-lg mb-1">{issue.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-1">{issue.description}</p>
                      </div>
                      <div className="self-center pr-2 text-slate-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5 border-dashed">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">No Missions Found</h3>
                  <p className="text-slate-500 mb-6 text-sm">You have not initialized any field reports yet.</p>
                  <Link to="/report" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                    <Plus size={18} /> Initialize Report
                  </Link>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'votes' ? (
            <motion.div
              key="votes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Votes Summary - Compact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ArrowBigUp size={20} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">{votedIssues.totalUpvotes}</div>
                    <div className="text-xs text-green-500/80 uppercase tracking-wide font-bold">Endorsements</div>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <ArrowBigDown size={20} className="text-red-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400">{votedIssues.totalDownvotes}</div>
                    <div className="text-xs text-red-500/80 uppercase tracking-wide font-bold">Flags</div>
                  </div>
                </div>
              </div>

              {/* Upvoted Issues */}
              {votedIssues.upvotedIssues?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 px-1 mt-4">Positive Consensus ({votedIssues.upvotedIssues.length})</p>
                  <div className="space-y-2">
                    {votedIssues.upvotedIssues.map(issue => (
                      <Link to={`/issue/${issue.id}`} key={issue.id} className="block group">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-900/20 overflow-hidden flex-shrink-0 flex items-center justify-center border border-green-500/20">
                            {issue.image ? (
                              <img src={issue.image} className="w-full h-full object-cover opacity-80" alt="" />
                            ) : (
                              <ArrowBigUp size={18} className="text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-200 text-sm line-clamp-1 group-hover:text-white transition-colors">{issue.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 font-mono">{issue.location}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold shrink-0">
                            UP
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Downvoted Issues */}
              {votedIssues.downvotedIssues?.length > 0 && (
                <div>
                   <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 px-1 mt-6">Negative Consensus ({votedIssues.downvotedIssues.length})</p>
                  <div className="space-y-2">
                    {votedIssues.downvotedIssues.map(issue => (
                      <Link to={`/issue/${issue.id}`} key={issue.id} className="block group">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-900/20 overflow-hidden flex-shrink-0 flex items-center justify-center border border-red-500/20">
                            {issue.image ? (
                              <img src={issue.image} className="w-full h-full object-cover opacity-80" alt="" />
                            ) : (
                              <ArrowBigDown size={18} className="text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-200 text-sm line-clamp-1 group-hover:text-white transition-colors">{issue.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 font-mono">{issue.location}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold shrink-0">
                            DOWN
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {votedIssues.upvotedIssues?.length === 0 && votedIssues.downvotedIssues?.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                    <ThumbsUp size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-1">No Data Points</h3>
                  <p className="text-sm text-slate-500 mb-4">Participate in consensus algorithms by voting on issues.</p>
                  <Link to="/issues" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-lg text-sm font-bold">
                    Browse Protocols
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0B1221]/80 rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <div className="relative border-l border-white/10 pl-6 space-y-8 py-2">
                {userIssues.slice(0, 5).map(issue => (
                  <div key={issue._id} className="relative group">
                    <span className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border border-[#0B1221] shadow-[0_0_10px_inherit] ${
                        issue.status === 'resolved' ? 'bg-green-500 shadow-green-500/50' : 'bg-blue-500 shadow-blue-500/50'
                    }`} />
                    <p className="text-sm text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">
                      Initialized Protocol <span className="font-bold text-white">"{issue.title}"</span>
                    </p>
                    <span className="text-xs text-slate-600 font-mono">{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                  </div>
                ))}
                <div className="relative">
                  <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full border border-[#0B1221] bg-slate-500" />
                  <p className="text-sm font-bold text-slate-300">Access Granted</p>
                  <span className="text-xs text-slate-600 font-mono">{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowImageUpload(false)}
          >
            <motion.div
              className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
               <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setShowImageUpload(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
               </div>

              <h3 className="text-xl font-black text-white mb-2 text-center uppercase tracking-wide">Biometric Update</h3>
              <p className="text-slate-400 text-center text-sm mb-8">Upload new identification parameter for your operative profile.</p>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                  <Camera size={18} />
                  {uploadingImage ? 'Encrypting...' : 'Upload Data'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                {user?.profilePicture && (
                  <button onClick={removeProfilePicture} className="px-4 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-colors">
                    Wipe Biometrics
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfilePage;