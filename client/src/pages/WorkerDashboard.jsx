import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, CheckCircle, Clock, AlertTriangle,
    MapPin, Camera, X, Upload, Loader2, Play, Search, Filter, Timer, LogOut, Map, List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

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
                toast.success(actionType === 'start' ? 'Work Started!' : 'Issue Resolved!');
                fetchAssignedIssues();
                closeModal();
            }
        } catch (error) {
            console.error(error);
            toast.error('Action failed. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            {viewMode === 'map' ? 'Task Map' : 'My Tasks'}
                        </h1>
                        <p className="text-slate-500">Welcome, {user?.name}</p>
                    </div>
                     <button onClick={logout} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                     assignedIssues.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900">No Pending Tasks</h3>
                            <p className="text-slate-500 text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignedIssues.map(issue => (
                                <motion.div
                                    key={issue._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
                                >
                                    <div className="flex gap-4 mb-4">
                                         <img 
                                            src={issue.images?.[0] || 'https://via.placeholder.com/100'} 
                                            className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                                         />
                                         <div>
                                             <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2 ${
                                                 issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                             }`}>
                                                 {issue.status.replace('_', ' ')}
                                             </span>
                                             <h3 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
                                             <p className="text-xs text-slate-500 line-clamp-1 mb-1">{issue.description}</p>
                                             <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <MapPin size={12} />
                                                <span className="truncate max-w-[150px]">{issue.location?.address || 'Location N/A'}</span>
                                             </div>
                                         </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {issue.status === 'reported' && (
                                            <button 
                                                onClick={() => handleActionClick(issue, 'start')}
                                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                <Play size={16} /> Start Work
                                            </button>
                                        )}
                                        {issue.status === 'in_progress' && (
                                            <button 
                                                onClick={() => handleActionClick(issue, 'resolve')}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Mark Done
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="h-[600px] rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 bg-white relative">
                        {assignedIssues.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
                                <p className="text-slate-500 font-bold">No locations to show</p>
                            </div>
                        ) : null}
                         <MapContainer 
                            center={[20.5937, 78.9629]} // Default (India) - typically should center on first issue
                            zoom={12} 
                            style={{ height: '100%', width: '100%' }}
                            // If we have issues, center on the first one
                            ref={(map) => {
                                if (map && assignedIssues.length > 0 && assignedIssues[0].location?.coordinates) {
                                    const coords = assignedIssues[0].location.coordinates;
                                    // map.setView([coords[1], coords[0]], 13);
                                    // Actually better to fit bounds if multiple
                                    const bounds = L.latLngBounds(assignedIssues.map(i => [i.location.coordinates[1], i.location.coordinates[0]]));
                                    map.fitBounds(bounds, { padding: [50, 50] });
                                }
                            }}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {assignedIssues.map(issue => (
                                <Marker 
                                    key={issue._id}
                                    position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2 ${
                                                 issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                             }`}>
                                                 {issue.status.replace('_', ' ')}
                                             </span>
                                            <h3 className="font-bold text-slate-900 mb-1">{issue.title}</h3>
                                            <p className="text-xs text-slate-500 mb-2">{issue.location?.address}</p>
                                            
                                            {issue.status === 'reported' && (
                                                <button 
                                                    onClick={() => handleActionClick(issue, 'start')}
                                                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                                                >
                                                    <Play size={12} /> Start Work
                                                </button>
                                            )}
                                            {issue.status === 'in_progress' && (
                                                <button 
                                                    onClick={() => handleActionClick(issue, 'resolve')}
                                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle size={12} /> Mark Done
                                                </button>
                                            )}
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
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl relative z-10"
                        >
                             <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
                             
                             <h2 className="text-xl font-bold text-slate-900 mb-6">
                                {actionType === 'start' ? 'Start Work' : 'Complete Task'}
                             </h2>

                             <div onClick={() => document.getElementById('file-upload').click()} className="border-4 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 mb-6">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="mx-auto text-slate-400 mb-2" size={32} />
                                        <p className="text-sm font-bold text-slate-500">Upload Photo Proof</p>
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
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                             >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm'}
                             </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default WorkerDashboard;
