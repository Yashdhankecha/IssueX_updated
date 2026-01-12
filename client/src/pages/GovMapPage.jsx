import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; // Import leaflet.heat (ensure it's installed)
import { ArrowLeft, Loader2, MapPin, Layers, Flame } from 'lucide-react';
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
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
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
                endpoint = '/api/issues?limit=1000&status=reported'; // Fetch reported issues mainly, or all
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
            toast.error('Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'reported': return '#f97316'; // orange
            case 'in_progress': return '#3b82f6'; // blue
            case 'resolved': return '#22c55e'; // green
            default: return '#64748b';
        }
    };

    const createIcon = (status) => {
        const color = getStatusColor(status);
        return L.divIcon({
            html: `
              <div class="relative">
                <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center" style="background-color: ${color}">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-black/20 blur-[1px]"></div>
              </div>
            `,
            className: 'custom-map-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
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
        <div className="relative w-full h-screen bg-slate-100 font-sans">
             {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[400] p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4 pointer-events-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 text-slate-700 hover:bg-white transition-all shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl shadow-lg border border-white/40 flex-1 sm:flex-none">
                             <h1 className="font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base whitespace-nowrap">
                                <MapPin className="text-blue-600 shrink-0" size={18} />
                                {isManager ? 'City Overview' : 'Dept Heatmap'}
                             </h1>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-1 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('markers')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                viewMode === 'markers' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <MapPin size={16} />
                            Markers
                        </button>
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                viewMode === 'heatmap' 
                                ? 'bg-orange-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Flame size={16} />
                            Heatmap
                        </button>
                    </div>
                </div>
            </div>

            <MapContainer 
                center={center} 
                zoom={5} 
                zoomControl={false} 
                className="absolute inset-0 z-0"
            >
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                            <Popup className="rounded-xl overflow-hidden">
                                <div className="p-2 min-w-[200px]">
                                    <img src={issue.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-32 object-cover rounded-lg mb-2 bg-slate-100" />
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
                                    <p className="text-xs text-slate-500 mb-2 truncate">{issue.location.address}</p>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white uppercase ${
                                        issue.status === 'reported' ? 'bg-orange-500' :
                                        issue.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}>
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {loading && (
                 <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                 </div>
            )}
        </div>
    );
};

export default GovMapPage;
