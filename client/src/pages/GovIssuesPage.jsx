import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  MapPin, Camera, X, Upload, Loader2, Play, Search, Filter, Timer, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GovIssuesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize tab from URL query param if present
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') === 'overdue' ? 'overdue' : 'reported';
  const [activeTab, setActiveTab] = useState(initialFilter);

  // Modal States
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Success State for AI Verification
  const [successData, setSuccessData] = useState(null);

  // Field Workers State
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');

  useEffect(() => {
    fetchIssues();
    fetchFieldWorkers();
  }, [activeTab]);

  const fetchFieldWorkers = async () => {
    try {
      const res = await api.get('/api/issues/field-workers');
      if (res.data.success) {
        setFieldWorkers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const handleAssignClick = (issue) => {
    setSelectedIssue(issue);
    setShowAssignModal(true);
    setSelectedWorker('');
  };

  const submitAssignment = async () => {
    if (!selectedWorker) return;
    try {
        const res = await api.put(`/api/issues/${selectedIssue._id}/assign-worker`, {
            workerId: selectedWorker
        });
        if (res.data.success) {
            toast.success('Worker assigned successfully');
            fetchIssues();
            setShowAssignModal(false);
            setSelectedWorker('');
            setSelectedIssue(null);
        }
    } catch (error) {
        toast.error('Failed to assign worker');
    }
  };

  // Handle direct navigation to issue via ID
  useEffect(() => {
    const startIssueId = queryParams.get('id');
    if (startIssueId && issues.length > 0) {
      const targetIssue = issues.find(i => i._id === startIssueId);
      if (targetIssue && targetIssue.status === 'reported') {
        handleActionClick(targetIssue, 'start');
      }
    }
  }, [issues, location.search]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let res;

      if (activeTab === 'overdue') {
        res = await api.get('/api/government/overdue-issues');
      } else {
        res = await api.get('/api/government/issues', {
          params: { status: activeTab }
        });
      }

      if (res.data.success) {
        if (activeTab === 'overdue') {
          setIssues(res.data.data.issues);
        } else {
          setIssues(res.data.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (issue, type) => {
    setSelectedIssue(issue);
    setActionType(type);
    setImageFile(null);
    setImagePreview(null);
    setSuccessData(null);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setActionType(null);
    setImageFile(null);
    setImagePreview(null);
    setSuccessData(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitAction = async () => {
    if (!imageFile) {
      toast.error('Please upload a proof photo');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    const endpoint = actionType === 'start'
      ? `/api/issues/${selectedIssue._id}/start-work`
      : `/api/issues/${selectedIssue._id}/resolve`;

    try {
      const res = await api.put(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        if (actionType === 'resolve') {
          setSuccessData(res.data.data);
          fetchIssues(); // Refresh list background
        } else {
          toast.success('Work Started!');
          fetchIssues();
          closeModal();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Action failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'reported', label: 'Reported', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'resolved', label: 'Sorted', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'overdue', label: 'Overdue', icon: Timer, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const formatOverdueDuration = (hours) => {
    if (!hours) return '';
    if (hours < 24) return `${hours}h overdue`;
    const days = Math.floor(hours / 24);
    return `${days}d overdue`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Issues</h1>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${isActive
                  ? `${tab.bg} ${tab.color} font-bold shadow-sm`
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <Icon size={18} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Issue List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : issues.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="mb-4 bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList size={32} />
              </div>
              No {activeTab.replace('_', ' ')} issues found.
            </div>
          ) : (
            issues.map(issue => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={issue._id}
                className={`bg-white p-4 rounded-2xl shadow-sm border ${activeTab === 'overdue' ? 'border-red-200 bg-red-50/10' : 'border-slate-100'
                  }`}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    <img
                      src={issue.images[0] || 'https://via.placeholder.com/100'}
                      alt="Issue"
                      className="w-full h-full rounded-xl object-cover bg-slate-100"
                    />
                    {activeTab === 'overdue' && (
                      <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Timer size={10} />
                        {formatOverdueDuration(issue.overdueBy)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-1">{issue.title}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{issue.description}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                      <MapPin size={12} />
                      <span className="truncate">{issue?.location?.address || 'Location unavailable'}</span>
                    </div>

                    {issue.assignedWorker && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 font-bold mb-3 bg-purple-50 px-2 py-1 rounded-md w-fit">
                            <Users size={12} />
                            <span>Assigned to: {issue.assignedWorker.name}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!issue.assignedWorker && (issue.status === 'reported' || issue.status === 'in_progress') && (
                        <button
                          onClick={() => handleAssignClick(issue)}
                          className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                        >
                          <Users size={16} />
                        </button>
                      )}

                      {(activeTab === 'reported' || (activeTab === 'overdue' && issue.status === 'reported')) && (
                        <button
                          onClick={() => handleActionClick(issue, 'start')}
                          className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                          <Play size={14} /> Start Work
                        </button>
                      )}
                      {(activeTab === 'in_progress' || (activeTab === 'overdue' && issue.status === 'in_progress')) && (
                        <button
                          onClick={() => handleActionClick(issue, 'resolve')}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                      )}
                      {activeTab === 'resolved' && (
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle size={12} /> Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showAssignModal && selectedIssue && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowAssignModal(false)}
              />
              <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative z-10"
              >
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Assign Issue</h2>
                  <p className="text-sm text-slate-500 mb-4">Select a field worker to handle this issue.</p>
                  
                  {fieldWorkers.length === 0 ? (
                      <div className="text-center py-4 bg-slate-50 rounded-xl mb-4">
                          <p className="text-slate-500 font-medium">No field workers found.</p>
                          <p className="text-xs text-slate-400 mt-1">Add users with 'field_worker' role.</p>
                      </div>
                  ) : (
                      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                          {fieldWorkers.map(worker => (
                              <div 
                                  key={worker._id}
                                  onClick={() => setSelectedWorker(worker._id)}
                                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                      selectedWorker === worker._id 
                                      ? 'border-purple-500 bg-purple-50' 
                                      : 'border-slate-100 hover:bg-slate-50'
                                  }`}
                              >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      selectedWorker === worker._id ? 'bg-purple-200 text-purple-700' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                      {worker.name.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800 text-sm">{worker.name}</div>
                                      <div className="text-xs text-slate-500">{worker.email}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowAssignModal(false)}
                          className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={submitAssignment}
                          disabled={!selectedWorker}
                          className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Assign
                      </button>
                  </div>
              </motion.div>
          </div>
        )}

        {selectedIssue && !showAssignModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl relative z-10"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

              {!successData ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      {actionType === 'start' ? 'Start Work' : 'Resolve Issue'}
                    </h2>
                    <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all relative overflow-hidden group">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Camera size={32} className="text-slate-400" />
                          </div>
                          <p className="font-bold text-slate-500">Upload Photo</p>
                          <p className="text-xs text-slate-400 mt-1">Click to browse</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                      <div className="text-blue-500 mt-0.5"><AlertTriangle size={18} /></div>
                      <div className="text-sm text-blue-700">
                        {actionType === 'start'
                          ? "Uploading a 'Before' photo notifies the user that work has begun."
                          : "Uploading an 'After' photo marks this issue as sorted and notifies the user."}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitAction}
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Upload'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete</h2>
                  <p className="text-slate-500 mb-8">The AI has analyzed your proof and verified the fix.</p>

                  <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <div className="text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">Confidence Score</div>
                    <div className="text-4xl font-extrabold text-green-500">
                      {successData.aiResolutionScore}%
                    </div>
                    <div className="text-xs text-green-600 font-medium mt-2 bg-green-100 inline-block px-3 py-1 rounded-full">
                      High Confidence Match
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GovIssuesPage;
