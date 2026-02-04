import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; 
import { ArrowLeft, Loader2, MapPin, Layers, Flame, Radar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Helper to fly to location
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// Heatmap Layer Component
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Points format: [lat, lng, intensity]
    // Increased intensity for dark mode visibility
    const heat = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: {
          0.4: '#3b82f6', // blue
          0.6: '#a855f7', // purple
          0.8: '#ef4444', // red
          1.0: '#f59e0b'  // amber/bright
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};

const GovMapPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default India
    const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'

    const isManager = user?.role === 'manager';

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            let endpoint = '/api/issues/assigned';
            
            // Managers see all issues
            if (isManager) {
                endpoint = '/api/issues?limit=1000&status=reported';
            }

            const res = await api.get(endpoint); 
            if (res.data.success) {
                const validIssues = res.data.data.filter(i => 
                    (i.location?.lat && i.location?.lng) || 
                    (i.location?.coordinates && i.location.coordinates.length === 2)
                );
                
                setIssues(validIssues);

                if (validIssues.length > 0) {
                    const first = validIssues[0];
                    const lat = first.location.lat || first.location.coordinates[1];
                    const lng = first.location.lng || first.location.coordinates[0];
                    if (lat && lng) setCenter([lat, lng]);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Satellite Uplink Failed');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'reported': return '#ef4444'; // Red for reported/critical
            case 'in_progress': return '#3b82f6'; // Blue for active
            case 'resolved': return '#10b981'; // Green for resolved
            default: return '#64748b';
        }
    };

    const createIcon = (status) => {
        const color = getStatusColor(status);
        return L.divIcon({
            html: `
              <div class="relative group">
                <div class="w-4 h-4 rounded-full shadow-[0_0_15px_${color}] flex items-center justify-center animate-pulse" style="background-color: ${color}">
                    <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-t from-transparent to-${color} opacity-50"></div>
              </div>
            `,
            className: 'custom-map-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -10]
        });
    };

    // Prepare heatmap data
    const heatmapPoints = issues.map(issue => {
        const lat = issue.location.lat || issue.location.coordinates?.[1];
        const lng = issue.location.lng || issue.location.coordinates?.[0];
        if (!lat || !lng) return null;
        return [lat, lng, 1.0]; // lat, lng, intensity
    }).filter(p => p !== null);

    return (
        <div className="relative w-full h-screen bg-[#030712] font-sans overflow-hidden">
             
             {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[400] p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4 pointer-events-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-3 bg-black/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 text-white hover:bg-black/80 transition-all shrink-0 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="bg-black/60 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-2xl shadow-lg border border-white/20 flex-1 sm:flex-none">
                             <h1 className="font-bold text-white flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base whitespace-nowrap uppercase tracking-wider">
                                <Radar className="text-blue-500 shrink-0 animate-spin-slow" size={18} />
                                {isManager ? 'City Surveillance' : 'Sector Heatmap'}
                             </h1>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-black/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-1 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('markers')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                viewMode === 'markers' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <MapPin size={14} />
                            Markers
                        </button>
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                viewMode === 'heatmap' 
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Flame size={14} />
                            Heatmap
                        </button>
                    </div>
                </div>
            </div>

            <MapContainer 
                center={center} 
                zoom={5} 
                zoomControl={false} 
                className="absolute inset-0 z-0 bg-[#030712]"
            >
                {/* Dark Matter Tiles */}
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <MapController center={center} />

                {viewMode === 'heatmap' && (
                    <HeatmapLayer points={heatmapPoints} />
                )}

                {viewMode === 'markers' && issues.map(issue => {
                    const lat = issue.location.lat || issue.location.coordinates?.[1];
                    const lng = issue.location.lng || issue.location.coordinates?.[0];
                    
                    if (!lat || !lng) return null;

                    return (
                        <Marker 
                            key={issue._id}
                            position={[lat, lng]}
                            icon={createIcon(issue.status)}
                        >
                            <Popup className="tech-popup">
                                <div className="p-0 min-w-[220px] bg-[#0B1221] text-white rounded-xl overflow-hidden border border-white/10">
                                    <div className="relative h-32 w-full">
                                         <img src={issue.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover opacity-80" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] to-transparent"></div>
                                         <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                            issue.status === 'reported' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                            issue.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'
                                         }`}>
                                            {issue.status.replace('_', ' ')}
                                         </span>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{issue.title}</h3>
                                        <p className="text-[10px] text-slate-400 mb-2 truncate font-mono">{issue.location.address}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {loading && (
                 <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-[#030712]/80 backdrop-blur-md">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                    <p className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">ACQUIRING TARGETS...</p>
                 </div>
            )}
            
            {/* Grid Overlay for tech effect */}
            <div className="absolute inset-0 pointer-events-none z-[1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
    );
};

export default GovMapPage;
