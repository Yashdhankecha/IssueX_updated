import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  MapPin, Camera, X, Upload, Loader2, Play, Search, Filter, Timer, Users, Radar, Scan
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
            toast.success('Operative Detailed Successfully');
            fetchIssues();
            setShowAssignModal(false);
            setSelectedWorker('');
            setSelectedIssue(null);
        }
    } catch (error) {
        toast.error('Assignment Failed');
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
      toast.error('Data Retrieval Failed');
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
      toast.error('Visual confirmation required');
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
          toast.success('Protocol Initiated');
          fetchIssues();
          closeModal();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'reported', label: 'PENDING', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'in_progress', label: 'ACTIVE', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'resolved', label: 'SORTED', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'overdue', label: 'OVERDUE', icon: Timer, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const formatOverdueDuration = (hours) => {
    if (!hours) return '';
    if (hours < 24) return `${hours}H LATE`;
    const days = Math.floor(hours / 24);
    return `${days}D LATE`;
  };

  return (
    <div className="min-h-screen bg-[#030712] p-6 pb-24 text-white relative font-sans overflow-hidden">
      
       {/* Ambient Background */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] right-[30%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 pt-10">
        <h1 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="text-blue-500"/>
            Task Management
        </h1>

        {/* Tabs */}
        <div className="flex bg-[#0B1221]/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 mb-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${isActive
                  ? `${tab.bg} ${tab.color} shadow-lg border border-white/5`
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Issue List */}
        <div className="space-y-4">
          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-32 bg-[#0B1221] rounded-2xl animate-pulse border border-white/5"></div>)}
             </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-24 text-slate-500 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="mb-4 bg-[#0B1221] w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Radar size={32} className="text-slate-600 opacity-50"/>
              </div>
              <p className="text-sm font-mono uppercase">No {activeTab.replace('_', ' ')} logs found.</p>
            </div>
          ) : (
            issues.map(issue => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={issue._id}
                className={`bg-[#0B1221]/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border relative overflow-hidden group ${activeTab === 'overdue' ? 'border-red-500/30' : 'border-white/10 hover:border-blue-500/30 transition-colors'
                  }`}
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    activeTab === 'overdue' ? 'bg-red-500' : 
                    activeTab === 'resolved' ? 'bg-emerald-500' :
                    activeTab === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                }`}></div>

                <div className="flex gap-5">
                  <div className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
                    {issue.images?.[0] ? (
                         <img
                          src={issue.images[0]}
                          alt="Issue"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                         />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                             <Camera size={24} />
                        </div>
                    )}
                    
                    {activeTab === 'overdue' && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-[10px] font-bold py-1 text-center uppercase tracking-wider backdrop-blur-sm">
                        {formatOverdueDuration(issue.overdueBy)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white line-clamp-1 text-base group-hover:text-blue-400 transition-colors">{issue.title}</h3>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap bg-white/5 px-2 py-0.5 rounded">{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                             <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wide">
                                <MapPin size={10} />
                                <span className="truncate max-w-[150px]">{issue?.location?.address || 'Unknown Coordinates'}</span>
                             </div>

                            {issue.assignedWorker && (
                                <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 uppercase tracking-wide">
                                    <Users size={10} />
                                    <span>OP: {issue.assignedWorker.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      {!issue.assignedWorker && (issue.status === 'reported' || issue.status === 'in_progress') && (
                        <button
                          onClick={() => handleAssignClick(issue)}
                          className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition-all uppercase tracking-wide"
                          title="Assign Operative"
                        >
                          <Users size={16} />
                        </button>
                      )}

                      {(activeTab === 'reported' || (activeTab === 'overdue' && issue.status === 'reported')) && (
                        <button
                          onClick={() => handleActionClick(issue, 'start')}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wide hover:border-blue-500/50"
                        >
                          <Play size={12} className="text-blue-400" /> Initialize
                        </button>
                      )}
                      {(activeTab === 'in_progress' || (activeTab === 'overdue' && issue.status === 'in_progress')) && (
                        <button
                          onClick={() => handleActionClick(issue, 'resolve')}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wide hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                          <CheckCircle size={12} /> Confirm Fix
                        </button>
                      )}
                      {activeTab === 'resolved' && (
                        <div className="w-full py-2 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-widest">
                          <CheckCircle size={12} /> Status: Clear
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
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  onClick={() => setShowAssignModal(false)}
              />
              <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0B1221] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 relative z-10 overflow-hidden"
              >
                  {/* Grid bg */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                  <h2 className="text-lg font-black text-white mb-1 uppercase tracking-wider relative z-10">Assign Operative</h2>
                  <p className="text-xs text-slate-500 mb-6 font-mono relative z-10">Select field agent for deployment.</p>
                  
                  {fieldWorkers.length === 0 ? (
                      <div className="text-center py-6 bg-[#0F172A] rounded-xl mb-4 border border-white/5 relative z-10">
                          <p className="text-slate-400 font-bold text-xs uppercase">No personnel available.</p>
                      </div>
                  ) : (
                      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                          {fieldWorkers.map(worker => (
                              <div 
                                  key={worker._id}
                                  onClick={() => setSelectedWorker(worker._id)}
                                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                      selectedWorker === worker._id 
                                      ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                      : 'border-white/5 bg-[#0F172A] hover:bg-white/5'
                                  }`}
                              >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border border-white/10 ${
                                      selectedWorker === worker._id ? 'bg-purple-500 text-white' : 'bg-black/40 text-slate-400'
                                  }`}>
                                      {worker.name.charAt(0)}
                                  </div>
                                  <div>
                                      <div className={`font-bold text-sm ${selectedWorker === worker._id ? 'text-white' : 'text-slate-300'}`}>{worker.name}</div>
                                      <div className="text-[10px] text-slate-500 font-mono">{worker.email}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  <div className="flex gap-3 relative z-10">
                      <button 
                          onClick={() => setShowAssignModal(false)}
                          className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-colors text-xs uppercase tracking-wide"
                      >
                          Abort
                      </button>
                      <button 
                          onClick={submitAssignment}
                          disabled={!selectedWorker}
                          className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 text-xs uppercase tracking-wide border border-purple-400/20"
                      >
                          Confirm
                      </button>
                  </div>
              </motion.div>
          </div>
        )}

        {selectedIssue && !showAssignModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={closeModal}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0B1221] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl relative z-10 border border-white/10 overflow-hidden"
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>

              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

              {!successData ? (
                <>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                       {actionType === 'start' ? <Play className="text-blue-500" size={18}/> : <CheckCircle className="text-emerald-500" size={18}/>}
                      {actionType === 'start' ? 'Initiate Protocol' : 'Verify Resolution'}
                    </h2>
                    <button onClick={closeModal} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-[#0F172A] transition-all relative overflow-hidden group bg-black/20">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                             <img src={imagePreview} className="w-full h-full object-cover opacity-80" alt="Preview" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-4">
                                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><Scan size={12}/> IMAGE LOADED</span>
                             </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Camera size={28} className="text-blue-400" />
                          </div>
                          <p className="font-bold text-slate-300 text-sm uppercase tracking-wide">Upload Evidence</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">TAP TO ACTIVATE CAMERA</p>
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

                    <div className="bg-blue-500/5 p-4 rounded-xl flex gap-3 border border-blue-500/10">
                      <div className="text-blue-400 mt-0.5"><AlertTriangle size={16} /></div>
                      <div className="text-xs text-blue-300 leading-relaxed font-mono">
                        {actionType === 'start'
                          ? "REQUIRED: UPLOAD 'BEFORE' STATE TO COMMENCE OPERATION."
                          : "REQUIRED: UPLOAD 'AFTER' STATE FOR AI VERIFICATION."}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitAction}
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-900/20 border border-blue-400/20"
                    >
                      {isSubmitting ? (
                          <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin" size={16} /> PROCESSING DATA...
                          </div>
                      ) : 'Confirm Upload'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center py-6 relative z-10">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500 w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Analysis Complete</h2>
                  <p className="text-slate-400 mb-8 text-sm font-mono">Verification Protocol Successful.</p>

                  <div className="w-full bg-[#0F172A] rounded-2xl p-6 mb-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-xl rounded-full"></div>
                    <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">AI Confidence Level</div>
                    <div className="text-5xl font-black text-emerald-400 tracking-tighter">
                      {successData.aiResolutionScore}%
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-2 bg-emerald-500/10 inline-block px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                       Match Confirmed
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 border border-white/10"
                  >
                    Close Protocol
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
