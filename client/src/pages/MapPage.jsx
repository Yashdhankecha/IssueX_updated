import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, MapPin, Navigation, Layers, ZoomIn, ZoomOut, Search, X, 
  Settings, Eye, Clock, CheckCircle, AlertCircle, ChevronDown, 
  Maximize2, Minimize2, ArrowLeft, Heart, Share2, Compass, Target,
  Crosshair
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// --- Custom Map Component to Handle Flying ---
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { 
          duration: 1.5,
          easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const { filteredIssues, loading, updateFilters, filters } = useIssue();
  const { selectedLocation, radius, updateRadius } = useLocation();
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapTheme, setMapTheme] = useState('dark'); // Default to dark for consistency
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map States
  const [viewState, setViewState] = useState({
    center: selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [20.5937, 78.9629],
    zoom: 13
  });

  // Theme Configs
  const tileLayers = {
    light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  // Initialize view
  useEffect(() => {
    if (selectedLocation) {
      setViewState({
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 15
      });
    }
  }, [selectedLocation]);

  // Marker Icon Generator
  const createCustomIcon = (category, status) => {
    const colors = {
      roads: '#f97316', lighting: '#eab308', water: '#3b82f6',
      cleanliness: '#8b5cf6', safety: '#ef4444', obstructions: '#10b981'
    };
    
    // SVG Icons
    const icons = {
      roads: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 1-12 0"/><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"/><path d="M12 22V10"/></svg>`, 
      lighting: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 1 0 5-5 5 5 0 0 0-5 5z"/></svg>`,
      water: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.74 5.74a8.13 8.13 0 0 1-11.48 0L12 2.69z"/><path d="M12 22a7.5 7.5 0 0 0 .5-14.5"/></svg>`,
      cleanliness: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      safety: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      obstructions: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    };

    const color = colors[category] || '#6b7280';
    const iconSvg = icons[category] || '';
    const isActive = status === 'reported' || status === 'in_progress';
    
    return L.divIcon({
      html: `
        <div class="relative group">
          <div class="w-10 h-10 rounded-xl border-2 border-[#030712] shadow-[0_0_15px_${color}] flex items-center justify-center transition-transform hover:scale-110" style="background-color: ${color}">
            ${status === 'resolved' ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : iconSvg}
          </div>
          ${isActive ? `<div class="absolute inset-0 rounded-xl animate-ping opacity-50" style="background-color: ${color}"></div>` : ''}
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-${color} opacity-50"></div>
        </div>
      `,
      className: 'custom-map-marker', 
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#030712] overflow-hidden font-sans">
      
      {/* --- Fullscreen Map Layer --- */}
      <MapContainer 
        center={viewState.center} 
        zoom={viewState.zoom} 
        zoomControl={false} 
        className="absolute inset-0 z-0 outline-none pb-20 lg:pb-0 bg-[#030712]"
      >
        <TileLayer 
            url={tileLayers[mapTheme]} 
            attribution='&copy; CARTO' 
            className={mapTheme === 'dark' ? 'brightness-75 contrast-125' : ''}
        />
        <MapController center={viewState.center} zoom={viewState.zoom} />

        {/* User Location */}
        {selectedLocation && (
             <>
                <Circle 
                    center={[selectedLocation.lat,selectedLocation.lng]} 
                    radius={radius * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '10, 20' }} 
                />
                <Marker 
                    position={[selectedLocation.lat,selectedLocation.lng]}
                    icon={L.divIcon({
                        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-[2px] border-white shadow-[0_0_20px_#3b82f6] relative"><div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-50"></div></div>`,
                        className: ''
                    })}
                />
             </>
        )}

        {/* Issue Markers */}
        {filteredIssues.map((issue) => (
             <Marker 
                key={issue._id || issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createCustomIcon(issue.category, issue.status)}
                eventHandlers={{
                    click: () => setSelectedIssue(issue)
                }}
             />
        ))}
      </MapContainer>

      {/* --- Top Navbar (Glassmorphism) --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-start gap-4 pointer-events-auto">
            <button 
                onClick={() => navigate(-1)} 
                className="p-3 bg-[#0B1221]/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search coordinates or sector..." 
                    className="w-full pl-10 pr-4 py-3 bg-[#0B1221]/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pointer-events-auto"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                            try {
                                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
                                const data = await response.json();
                                if (data && data.length > 0) {
                                    const { lat, lon } = data[0];
                                    setViewState({ center: [parseFloat(lat), parseFloat(lon)], zoom: 14 });
                                }
                            } catch (error) { console.error('Search error:', error); }
                        }
                    }}
                />
            </div>

            {/* Filters Toggle Button */}
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl shadow-lg border border-white/10 transition-all transform hover:scale-105 active:scale-95 ${showFilters ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-[#0B1221]/80 text-slate-400 backdrop-blur-md hover:text-white hover:bg-white/10'}`}
            >
                <Filter size={20} />
            </button>
        </div>
      </div>

      {/* --- Right Controls Helper --- */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20 flex flex-col gap-3 pointer-events-none">
         <div className="pointer-events-auto flex flex-col gap-3 bg-[#0B1221]/80 backdrop-blur p-2 rounded-2xl border border-white/10 shadow-xl">
            <button 
                onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))}
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 shadow-sm transition-colors border border-white/5"
                title="Zoom In"
            >
                <ZoomIn size={20} />
            </button>
            <button 
                onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 3) }))}
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 shadow-sm transition-colors border border-white/5"
                title="Zoom Out"
            >
                <ZoomOut size={20} />
            </button>
         </div>

         <button 
            onClick={() => setMapTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'satellite' : 'light')}
            className="pointer-events-auto p-3 bg-[#0B1221]/80 text-slate-400 hover:text-white rounded-2xl shadow-xl hover:bg-white/10 transition-all active:scale-95 border border-white/10 backdrop-blur"
            title="Switch Map Theme"
         >
            <Layers size={20} />
         </button>

         <button 
            onClick={() => {
                if(selectedLocation) setViewState({center: [selectedLocation.lat, selectedLocation.lng], zoom: 16})
            }}
            className="pointer-events-auto p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-500 active:scale-95"
            title="Locate Me"
         >
            <Crosshair size={20} />
         </button>
      </div>

      {/* --- Filter Panel (Dropdown) --- */}
      <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-24 left-4 right-4 md:left-20 md:right-auto md:w-80 z-20 bg-[#0B1221]/90 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/10"
            >
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><Filter size={14} className="text-blue-500"/> Filter Matrix</h3>
                  <button onClick={() => updateFilters({ status: 'all', category: 'all' })} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider border border-blue-500/30 px-2 py-1 rounded bg-blue-500/10">Reset</button>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Status Protocol</label>
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                        {['all', 'reported', 'in_progress', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => updateFilters({ ...filters, status })}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${filters.status === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {status === 'all' ? 'All' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Category Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['all', 'roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => updateFilters({ ...filters, category: cat })}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${filters.category === cat ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Scan Radius: <span className="text-white">{radius}km</span></label>
                     <input 
                       type="range" min="1" max="20" value={radius} 
                       onChange={(e) => updateRadius(Number(e.target.value))}
                       className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" 
                     />
                  </div>
               </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- Issue Detail Card (Bottom Sheet) --- */}
      <AnimatePresence>
        {selectedIssue && (
            <motion.div 
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute bottom-4 left-4 right-4 md:left-auto md:right-16 md:w-96 md:bottom-8 z-30"
            >
                <div className="bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative h-36 bg-black/50 group">
                        {selectedIssue.images?.[0] ? (
                            <img src={selectedIssue.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-[#0B1221]"><MapPin size={32} /></div>
                        )}
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
                        <button 
                            onClick={() => setSelectedIssue(null)}
                            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur transition-colors border border-white/10"
                        >
                            <X size={16} />
                        </button>
                        <div className="absolute bottom-3 left-4">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md">
                                {selectedIssue.category}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-5 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                             <h2 className="font-bold text-lg text-white leading-tight line-clamp-1">{selectedIssue.title}</h2>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                 selectedIssue.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                 selectedIssue.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                 'bg-red-500/10 text-red-400 border-red-500/20'
                             }`}>
                                {selectedIssue.status.replace('_', ' ')}
                             </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-5 leading-relaxed font-mono">{selectedIssue.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <Clock size={12} className="mr-1.5 text-slate-600" />
                                {formatDistanceToNow(new Date(selectedIssue.createdAt))} ago
                             </div>
                             <button 
                                onClick={() => navigate(`/issue/${selectedIssue._id || selectedIssue.id}`)}
                                className="flex items-center text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                             >
                                ACCESS DATA
                                <ArrowLeft size={12} className="ml-1.5 rotate-180" />
                             </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- Loading State --- */}
      {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                <p className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">SATELLITE SYNC...</p>
             </div>
          </div>
      )}
    </div>
  );
};

export default MapPage;