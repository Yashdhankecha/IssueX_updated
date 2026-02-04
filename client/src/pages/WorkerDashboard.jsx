import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, CheckCircle, Clock, AlertTriangle,
    MapPin, Camera, X, Upload, Loader2, Play, Search, Filter, Timer, LogOut, Map, List, Scan, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Marker Code
const createCustomIcon = (status) => {
    let color = '#3b82f6'; // blue default
    if (status === 'reported') color = '#ef4444'; // red
    if (status === 'resolved') color = '#10b981'; // green

    return L.divIcon({
        html: `
          <div class="relative group">
            <div class="w-4 h-4 rounded-full shadow-[0_0_15px_${color}] flex items-center justify-center animate-pulse" style="background-color: ${color}">
                <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        className: 'custom-map-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
    });
};

const WorkerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const viewMode = queryParams.get('view') === 'map' ? 'map' : 'list';

    const [assignedIssues, setAssignedIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [actionType, setActionType] = useState(null); // 'start', 'resolve'
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignedIssues();
    }, []);

    const fetchAssignedIssues = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/issues/worker/assigned'); 
            if (res.data.success) {
                setAssignedIssues(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (issue, type) => {
        setSelectedIssue(issue);
        setActionType(type);
        setImageFile(null);
        setImagePreview(null);
    };

    const closeModal = () => {
        setSelectedIssue(null);
        setActionType(null);
        setImageFile(null);
        setImagePreview(null);
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
                toast.success(actionType === 'start' ? 'Protocol Initiated' : 'Status: Resolved');
                fetchAssignedIssues();
                closeModal();
            }
        } catch (error) {
            console.error(error);
            toast.error('Operation Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                 <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] p-6 pb-24 font-sans relative">
             {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between pt-6">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                             <Target className="text-blue-500"/>
                            {viewMode === 'map' ? 'Tactical Map' : 'Objectives'}
                        </h1>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Operative: {user?.name}</p>
                    </div>
                     <button 
                        onClick={logout} 
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white border border-red-500/20 transition-all shadow-lg"
                        title="Sign Off"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                     assignedIssues.length === 0 ? (
                        <div className="text-center py-24 bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/10">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <CheckCircle className="text-emerald-500" size={32} />
                            </div>
                            <h3 className="font-bold text-white uppercase tracking-wide mb-1">Queue Empty</h3>
                            <p className="text-slate-500 text-xs font-mono">Standby for new directives.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignedIssues.map(issue => (
                                <motion.div
                                    key={issue._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#0B1221]/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-all"
                                >
                                     {/* Status Stripe */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                                        issue.status === 'in_progress' ? 'bg-blue-500' : 'bg-red-500'
                                    }`} />

                                    <div className="flex gap-4 mb-4">
                                         <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 relative">
                                            <img 
                                                src={issue.images?.[0] || 'https://via.placeholder.com/100'} 
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <div className="flex justify-between items-start mb-1">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                    issue.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                    {issue.status.replace('_', ' ')}
                                                </span>
                                             </div>
                                             <h3 className="font-bold text-white line-clamp-1 text-sm group-hover:text-blue-400 transition-colors">{issue.title}</h3>
                                             <p className="text-xs text-slate-400 line-clamp-1 mb-2 font-light">{issue.description}</p>
                                             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                                <MapPin size={10} />
                                                <span className="truncate max-w-[200px] uppercase">{issue.location?.address || 'COORDINATES UNKNOWN'}</span>
                                             </div>
                                         </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {issue.status === 'reported' && (
                                            <button 
                                                onClick={() => handleActionClick(issue, 'start')}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                                            >
                                                <Play size={14} className="text-blue-400" /> Initialize
                                            </button>
                                        )}
                                        {issue.status === 'in_progress' && (
                                            <button 
                                                onClick={() => handleActionClick(issue, 'resolve')}
                                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                            >
                                                <CheckCircle size={14} /> Confirm Fix
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0B1221] relative">
                         {/* Map Overlay scanning effect */}
                        <div className="absolute inset-0 pointer-events-none z-[400] bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                        
                        {assignedIssues.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center z-[500] bg-[#030712]/80 backdrop-blur-sm">
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg bg-black/50">Sector Clear</p>
                            </div>
                        ) : null}
                         <MapContainer 
                            center={[20.5937, 78.9629]} 
                            zoom={12} 
                            style={{ height: '100%', width: '100%', background: '#030712' }}
                            ref={(map) => {
                                if (map && assignedIssues.length > 0 && assignedIssues[0].location?.coordinates) {
                                    const bounds = L.latLngBounds(assignedIssues.map(i => [i.location.coordinates[1], i.location.coordinates[0]]));
                                    map.fitBounds(bounds, { padding: [50, 50] });
                                }
                            }}
                        >
                            <TileLayer 
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {assignedIssues.map(issue => (
                                <Marker 
                                    key={issue._id}
                                    position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                    icon={createCustomIcon(issue.status)}
                                >
                                    <Popup className="tech-popup">
                                         <div className="p-0 min-w-[200px] bg-[#0B1221] text-white rounded-xl overflow-hidden border border-white/10">
                                            <div className="p-3">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase mb-2 border ${
                                                     issue.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                 }`}>
                                                     {issue.status.replace('_', ' ')}
                                                 </span>
                                                <h3 className="font-bold text-white text-xs mb-1 line-clamp-1">{issue.title}</h3>
                                                <p className="text-[10px] text-slate-400 mb-2 truncate font-mono">{issue.location?.address}</p>
                                                
                                                {issue.status === 'reported' && (
                                                    <button 
                                                        onClick={() => handleActionClick(issue, 'start')}
                                                        className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide border border-white/10"
                                                    >
                                                        Initialize
                                                    </button>
                                                )}
                                                {issue.status === 'in_progress' && (
                                                    <button 
                                                        onClick={() => handleActionClick(issue, 'resolve')}
                                                        className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide border border-emerald-500/30"
                                                    >
                                                        Finalize
                                                    </button>
                                                )}
                                            </div>
                                         </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <AnimatePresence>
                {selectedIssue && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-[#0B1221] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl relative z-10 border border-white/10 overflow-hidden"
                        >
                              {/* Grid Background */}
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                             <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:hidden relative z-10" />
                             
                             <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider relative z-10 flex items-center gap-2">
                                {actionType === 'start' ? <Play className="text-blue-500" size={18}/> : <CheckCircle className="text-emerald-500" size={18}/>}
                                {actionType === 'start' ? 'Initiate Protocol' : 'Mission Debrief'}
                             </h2>

                             <div onClick={() => document.getElementById('file-upload').click()} className="border-2 border-dashed border-white/10 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-[#0F172A] hover:border-blue-500/50 transition-all mb-6 relative z-10 group overflow-hidden bg-black/20">
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                         <img src={imagePreview} className="w-full h-full object-cover opacity-80" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-4">
                                             <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 uppercase tracking-wide"><Scan size={12}/> Data Acquired</span>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="text-center group-hover:scale-105 transition-transform">
                                        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                            <Camera className="text-blue-400" size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">Upload Visual Evidence</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">TAP TO ACTIVATE SENSOR</p>
                                    </div>
                                )}
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                             </div>

                             <button 
                                onClick={handleSubmitAction}
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative z-10 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 border border-blue-400/20 uppercase tracking-widest text-sm"
                             >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Upload'}
                             </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkerDashboard;
