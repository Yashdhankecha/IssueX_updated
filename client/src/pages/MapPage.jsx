import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, MapPin, Navigation, Layers, ZoomIn, ZoomOut, Search, X, 
  Settings, Eye, Clock, CheckCircle, AlertCircle, ChevronDown, 
  Maximize2, Minimize2, ArrowLeft, Heart, Share2, Compass
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
  const [mapTheme, setMapTheme] = useState('light'); // 'light', 'dark', 'satellite'
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
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110" style="background-color: ${color}">
            ${status === 'resolved' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : iconSvg}
          </div>
          ${isActive ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-black/20 blur-[1px]"></div>
        </div>
      `,
      className: 'custom-map-marker', 
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* --- Fullscreen Map Layer --- */}
      <MapContainer 
        center={viewState.center} 
        zoom={viewState.zoom} 
        zoomControl={false} 
        className="absolute inset-0 z-0 outline-none pb-20 lg:pb-0"
      >
        <TileLayer 
            url={tileLayers[mapTheme]} 
            attribution='&copy; CARTO' 
        />
        <MapController center={viewState.center} zoom={viewState.zoom} />

        {/* User Location */}
        {selectedLocation && (
             <>
                <Circle 
                    center={[selectedLocation.lat,selectedLocation.lng]} 
                    radius={radius * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, dashArray: '5, 10' }} 
                />
                <Marker 
                    position={[selectedLocation.lat,selectedLocation.lng]}
                    icon={L.divIcon({
                        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-[3px] border-white shadow-md relative"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div></div>`,
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
                className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 text-slate-700 hover:bg-white transition-all transform hover:scale-105 active:scale-95"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search area (Press Enter)..." 
                    className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pointer-events-auto"
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
                className={`p-3 rounded-2xl shadow-lg border border-white/40 transition-all transform hover:scale-105 active:scale-95 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white'}`}
            >
                <Filter size={20} />
            </button>
        </div>
      </div>

      {/* --- Right Controls Helper --- */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20 flex flex-col gap-3 pointer-events-none">
         <div className="pointer-events-auto flex flex-col gap-3 bg-white/10 backdrop-blur p-2 rounded-2xl border border-white/20 shadow-xl">
            <button 
                onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))}
                className="p-3 bg-white text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 shadow-sm transition-colors"
                title="Zoom In"
            >
                <ZoomIn size={20} />
            </button>
            <button 
                onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 3) }))}
                className="p-3 bg-white text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 shadow-sm transition-colors"
                title="Zoom Out"
            >
                <ZoomOut size={20} />
            </button>
         </div>

         <button 
            onClick={() => setMapTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'satellite' : 'light')}
            className="pointer-events-auto p-3 bg-white text-slate-700 rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 border-2 border-slate-100"
            title="Switch Map Theme"
         >
            <Layers size={20} />
         </button>

         <button 
            onClick={() => {
                if(selectedLocation) setViewState({center: [selectedLocation.lat, selectedLocation.lng], zoom: 16})
            }}
            className="pointer-events-auto p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95"
            title="Locate Me"
         >
            <Navigation size={20} />
         </button>
      </div>

      {/* --- Filter Panel (Dropdown) --- */}
      <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-24 left-4 right-4 md:left-20 md:right-auto md:w-80 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50"
            >
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Filter Issues</h3>
                  <button onClick={() => updateFilters({ status: 'all', category: 'all' })} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Reset</button>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['all', 'reported', 'in_progress', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => updateFilters({ ...filters, status })}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filters.status === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['all', 'roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => updateFilters({ ...filters, category: cat })}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold capitalize transition-all border ${filters.category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Radius: {radius}km</label>
                     <input 
                       type="range" min="1" max="20" value={radius} 
                       onChange={(e) => updateRadius(Number(e.target.value))}
                       className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer" 
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
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                    <div className="relative h-32 bg-slate-200">
                        {selectedIssue.images?.[0] ? (
                            <img src={selectedIssue.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><MapPin size={32} /></div>
                        )}
                        <button 
                            onClick={() => setSelectedIssue(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-3">
                            <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur text-xs font-bold shadow-sm uppercase tracking-wide text-slate-800">
                                {selectedIssue.category}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                             <h2 className="font-bold text-lg text-slate-900 leading-tight line-clamp-1">{selectedIssue.title}</h2>
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedIssue.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {selectedIssue.status}
                             </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{selectedIssue.description}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                             <div className="flex items-center text-xs text-slate-400">
                                <Clock size={12} className="mr-1" />
                                {formatDistanceToNow(new Date(selectedIssue.createdAt))} ago
                             </div>
                             <button 
                                onClick={() => navigate(`/issue/${selectedIssue._id || selectedIssue.id}`)}
                                className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                             >
                                Details
                                <ArrowLeft size={14} className="ml-1 rotate-180" />
                             </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- Loading State --- */}
      {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
             <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
      )}
    </div>
  );
};

export default MapPage;