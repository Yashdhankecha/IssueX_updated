import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Calendar, MapPin, Activity, Shield, Award, Clock,
  CheckCircle, AlertCircle, Plus, Edit, Settings, Sparkles, TrendingUp,
  Heart, Camera, ArrowRight, X, LogOut, Share2, MoreHorizontal,
  ThumbsUp, ThumbsDown, ArrowBigUp, ArrowBigDown
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
      toast.error('Image size must be less than 5MB');
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
        toast.success('Profile picture updated successfully!');
        if (updateUser) updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingImage(false);
      setShowImageUpload(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await api.delete('/api/auth/profile/picture');
      if (response.data.success) {
        toast.success('Profile picture removed!');
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
    <div className="min-h-screen bg-slate-50 relative pb-20">

      {/* --- Abstract Background --- */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 md:pt-20">

        {/* --- Profile Header Card --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden mb-8">
          {/* Banner with Logout */}
          <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <button
              onClick={logout}
              className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-xs font-bold text-white hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>



          {/* Profile Content */}
          <div className="px-6 md:px-10 pb-8">
            <div className="flex flex-col md:flex-row gap-6 relative">
              {/* Avatar - Floating partially over banner */}
              <div className="relative -mt-16 shrink-0 flex justify-center md:justify-start group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-white relative z-10 transition-transform hover:scale-105">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <User size={48} />

                    </div>
                  )}
                  {/* Edit Overlay */}
                  <div
                    onClick={() => setShowImageUpload(true)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20"
                  >
                    <Camera className="text-white" />
                  </div>
                </div>
                {/* Verified Badge */}
                <div className="absolute bottom-2 right-0 md:right-auto md:left-32 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white z-20">
                  <CheckCircle size={14} fill="currentColor" className="text-green-500 bg-white rounded-full" />
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 pt-2 md:pt-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">{user?.name}</h1>
                    <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
                      <Mail size={14} /> {user?.email}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-700">{stats.impactScore}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Impact Score</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/settings" className="self-center md:self-start px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2">
                    <Settings size={18} /> Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-black text-slate-900 mb-1">{stats.total}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports</div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-black text-green-500 mb-1">{stats.resolved}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-black text-blue-500 mb-1">Top 5%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</div>
          </div>
        </div>

        {/* --- Content Tabs --- */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-8 px-4 overflow-x-auto scrollbar-hide">
          {['issues', 'votes', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'issues' ? 'My Reports' : tab === 'votes' ? (
                <span className="flex items-center gap-2">
                  My Votes
                  {(votedIssues.totalUpvotes + votedIssues.totalDownvotes) > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {votedIssues.totalUpvotes + votedIssues.totalDownvotes}
                    </span>
                  )}
                </span>
              ) : 'Recent Activity'}
              {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-t-full" />}
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
                <div className="text-center py-20 text-slate-400">Loading details...</div>
              ) : userIssues.length > 0 ? (
                userIssues.map(issue => (
                  <Link to={`/issue/${issue._id || issue.id}`} key={issue._id || issue.id} className="block group">
                    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-3 items-start sm:items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 mt-1 sm:mt-0">
                        {issue.images?.[0] ? (
                          <img src={issue.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><MapPin size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${issue.status === 'resolved' ? 'bg-green-500' : issue.status === 'in_progress' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wide">{issue.status.replace('_', ' ')}</span>
                          </div>
                          <span className="text-slate-300 text-[10px] sm:text-xs">•</span>
                          <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[120px] sm:max-w-none">{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                        </div>
                        <h3 className="font-bold text-slate-900 line-clamp-1 sm:line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">{issue.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">{issue.description}</p>
                      </div>
                      <div className="self-center pr-1 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all">
                        <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Activity size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No reports yet</h3>
                  <p className="text-slate-500 mb-6">You haven't reported any civic issues yet.</p>
                  <Link to="/report" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Make a Report
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
                <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ArrowBigUp size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-600">{votedIssues.totalUpvotes}</div>
                    <div className="text-xs text-emerald-500">Upvotes</div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ArrowBigDown size={20} className="text-red-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">{votedIssues.totalDownvotes}</div>
                    <div className="text-xs text-red-500">Downvotes</div>
                  </div>
                </div>
              </div>

              {/* Upvoted Issues */}
              {votedIssues.upvotedIssues?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 px-1">Upvoted</p>
                  <div className="space-y-2">
                    {votedIssues.upvotedIssues.map(issue => (
                      <Link to={`/issue/${issue.id}`} key={issue.id} className="block">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex gap-3 items-center active:scale-[0.99] transition-transform">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {issue.image ? (
                              <img src={issue.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <ArrowBigUp size={18} className="text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 text-sm line-clamp-1">{issue.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{issue.location}</p>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium shrink-0">
                            ↑
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
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 px-1">Downvoted</p>
                  <div className="space-y-2">
                    {votedIssues.downvotedIssues.map(issue => (
                      <Link to={`/issue/${issue.id}`} key={issue.id} className="block">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex gap-3 items-center active:scale-[0.99] transition-transform">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {issue.image ? (
                              <img src={issue.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <ArrowBigDown size={18} className="text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 text-sm line-clamp-1">{issue.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{issue.location}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium shrink-0">
                            ↓
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
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <ThumbsUp size={24} />
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">No votes yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Vote on issues to help prioritize them</p>
                  <Link to="/issues" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                    Browse Issues
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
              className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100"
            >
              <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 py-2">
                {userIssues.slice(0, 5).map(issue => (
                  <div key={issue._id} className="relative">
                    <span className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white ${issue.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <p className="text-sm text-slate-600 mb-0.5">
                      Reported <span className="font-medium text-slate-900">"{issue.title}"</span>
                    </p>
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                  </div>
                ))}
                <div className="relative">
                  <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-300" />
                  <p className="text-sm font-medium text-slate-900">Joined the Platform</p>
                  <span className="text-xs text-slate-400">{new Date(user?.createdAt).toLocaleDateString()}</span>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowImageUpload(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Change Photo</h3>
              <p className="text-slate-500 text-center text-sm mb-6">Update your profile picture to be easily recognized.</p>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-colors">
                  <Camera size={18} />
                  {uploadingImage ? 'Uploading...' : 'Upload New Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                {user?.profilePicture && (
                  <button onClick={removeProfilePicture} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                    Remove Current Photo
                  </button>
                )}
                <button onClick={() => setShowImageUpload(false)} className="px-4 py-2 text-slate-400 font-bold hover:text-slate-600">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfilePage;