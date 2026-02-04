import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Map, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Activity, 
  Search, 
  Shield, 
  Bell,
  Sun,
  Moon,
  Navigation,
  Hash
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import IssueCard from '../components/IssueCard';

const HomePage = () => {
  const { filteredIssues, loading, getIssueStats, filters, updateFilters } = useIssue();
  const { selectedLocation } = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const stats = getIssueStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('Welcome back');
  const [weather, setWeather] = useState({ temp: '--', location: 'Locating...' });
  const [weatherIcon, setWeatherIcon] = useState(<Sun size={24} className="text-yellow-400" />);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchWeather = async () => {
       try {
          let lat, lng, locationName;

          if (selectedLocation && typeof selectedLocation === 'object' && selectedLocation.lat) {
               lat = selectedLocation.lat;
               lng = selectedLocation.lng;
               locationName = selectedLocation.town;
          } else if (typeof selectedLocation === 'string' && selectedLocation !== '') {
               locationName = selectedLocation.split(',')[0];
          }

          if (!lat || !lng) {
             try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            // eslint-disable-next-line no-unused-vars
             } catch (geoError) {
                lat = 12.9716; 
                lng = 77.5946;
                locationName = locationName || 'Select Location';
             }
          }

          // Fetch name if missing
          if (!locationName && lat && lng) {
             try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const geoData = await geoRes.json();
                locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Current Location';
             } catch (e) { /* ignore */ }
          }

          if(!locationName) locationName = 'Select Location';

          setWeather(prev => ({ ...prev, location: locationName }));

          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day&timezone=auto`);
          const data = await res.json();
          
          if(data.current) {
             setWeather({ 
                 temp: Math.round(data.current.temperature_2m), 
                 location: locationName 
             });
             if(data.current.is_day === 0) setWeatherIcon(<Moon size={24} className="text-blue-400" />);
             else setWeatherIcon(<Sun size={24} className="text-yellow-400" />);
          }
       } catch(e) { console.error('Weather error:', e); }
    };
    fetchWeather();
  }, [selectedLocation]);

  const categories = [
    { value: 'all', label: 'All Sytems', icon: Hash },
    { value: 'roads', label: 'Road Grid', icon: Map },
    { value: 'garbage', label: 'Sanitation', icon: AlertCircle },
    { value: 'water', label: 'Water', icon: Activity },
    { value: 'streetlights', label: 'Power', icon: Clock },
    { value: 'safety', label: 'Secure', icon: Shield },
  ];

  const statusStats = [
    { label: 'Total Reports', count: stats.total, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Activity },
    { label: 'Resolved', count: stats.resolved, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
    { label: 'Pending', count: stats.inProgress, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
    { label: 'Flagged', count: stats.reported, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500 selection:text-white w-full max-w-[100vw] overflow-x-hidden relative">
      
       {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- Mobile Sticky Header --- */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between transition-all duration-300 w-full">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/20">
               {user?.profilePicture ? (
                 <img 
                   src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                   alt="Profile" 
                   className="w-full h-full object-cover rounded-full"
                 />
               ) : (
                 user?.name?.charAt(0) || 'U'
               )}
            </div>
            <div>
               <h1 className="text-sm font-bold text-white leading-tight">
                  <span className="text-blue-400">Op.</span> {user?.name?.split(' ')[0] || 'User'}
               </h1>
               <div className="flex items-center text-xs text-slate-400">
                  <MapPin size={10} className="mr-0.5 text-green-400" />
                  <span className="truncate max-w-[150px]">
                     {weather.location !== 'Bengaluru' ? weather.location : (selectedLocation?.town || selectedLocation || 'Locating...')} 
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center space-x-2">
            <Link to="/notifications" className="p-2 text-slate-400 hover:text-white relative transition-colors">
               <Bell size={24} />
               {unreadCount > 0 && (
                   <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#030712] animate-pulse"></span>
               )}
            </Link>
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6 lg:space-y-10">
      
        {/* --- Desktop Header & Weather --- */}
        <div className="hidden lg:flex items-end justify-between mb-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-2"
            >
               <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">{user?.name?.split(' ')[0]}</span>
               </h1>
               <p className="text-lg text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  System Operational. Ready for reports.
               </p>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default"
            >
                {weatherIcon}
                <span className="font-bold text-white text-lg">{weather.temp}°C</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 text-sm font-medium">{weather.location}</span>
            </motion.div>
        </div>

        {/* --- Hero / CTA Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-[#0B1221]/80 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 px-6 py-8 lg:px-12 lg:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-6 max-w-lg">
                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Active Coverage Area
                   </div>
                   <h2 className="text-3xl lg:text-5xl font-bold leading-tight text-white">
                      Detect. Report. <br/>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Resolve.</span>
                   </h2>
                   <p className="text-slate-400 text-lg">
                      Deploy civic intelligence to fix infrastructure issues in your sector instantly.
                   </p>
                   <Link 
                      to="/report" 
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border border-white/10 group"
                   >
                      Initialize Report <Plus size={20} className="ml-2 group-hover:rotate-90 transition-transform" />
                   </Link>
                </div>
                
                <div className="hidden md:block relative">
                    {/* Floating HUD Elements */}
                     <div className="relative w-64 h-64">
                         <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping-slow"></div>
                         <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-spin-slow-reverse border-dashed"></div>
                         
                         <div className="absolute top-0 left-0 p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl flex items-center gap-3 animate-float">
                             <MapPin className="text-blue-400" />
                             <div>
                                 <div className="text-xs text-slate-500 uppercase">Sector 4</div>
                                 <div className="text-sm font-bold">Grid Active</div>
                             </div>
                         </div>

                         <div className="absolute bottom-0 right-0 p-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl flex items-center gap-3 animate-float delay-700">
                             <Activity className="text-green-400" />
                             <div>
                                 <div className="text-xs text-slate-500 uppercase">Status</div>
                                 <div className="text-sm font-bold">Optimal</div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </motion.div>

        {/* --- Search & Filter Bar --- */}
        <div className="sticky top-[60px] lg:top-4 z-30 bg-[#030712]/95 backdrop-blur-md pb-4 pt-2 lg:mx-0 lg:px-0 lg:bg-transparent lg:backdrop-blur-none lg:static">
             <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search protocol ID, sector, or keyword..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        updateFilters({ search: e.target.value });
                      }}
                      className="w-full pl-12 pr-4 py-3 lg:py-4 bg-[#0B1221]/50 border border-white/10 rounded-xl lg:rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none transition-all"
                    />
                </div>
                
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 lg:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilters({ category: cat.value })}
                      className={`flex-shrink-0 px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap border flex items-center space-x-2 ${
                        filters?.category === cat.value
                          ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {cat.icon && <cat.icon size={14} className={filters?.category === cat.value ? 'text-white' : 'text-slate-500'} />}
                      <span>{cat.label}</span>
                    </button>
                  ))}
               </div>
             </div>
        </div>

        {/* --- Stats Grid --- */}
        <div>
           <h3 className="text-sm lg:text-base font-bold text-slate-400 mb-4 px-1 flex items-center uppercase tracking-wider">
              <Activity size={16} className="mr-2 text-blue-500" />
              Network Overview
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {statusStats.map((stat, i) => (
                 <motion.div 
                    key={i} 
                    whileHover={{ y: -4 }}
                    className={`p-4 lg:p-6 rounded-2xl border ${stat.bg} backdrop-blur-sm flex flex-col justify-between h-28 lg:h-36 hover:brightness-125 transition-all duration-300 relative overflow-hidden group`}
                 >
                     <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                        <stat.icon size={64} className={stat.color} />
                     </div>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/5 ${stat.color}`}>
                        <stat.icon size={20} />
                     </div>
                     <div>
                        <span className="text-3xl lg:text-4xl font-black text-white block tracking-tighter">{stat.count}</span>
                        <span className={`text-xs lg:text-sm font-bold uppercase tracking-wide opacity-80 ${stat.color}`}>{stat.label}</span>
                     </div>
                 </motion.div>
              ))}
           </div>
        </div>

        {/* --- Recent Activity Grid --- */}
        <div className="pb-4 lg:pb-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-lg lg:text-xl font-bold text-white flex items-center">
               <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
               Recent Transmissions
            </h3>
            <Link to="/map" className="group text-sm font-bold text-blue-400 flex items-center hover:text-blue-300 transition-colors uppercase tracking-wider">
               Satellite View <Navigation size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
              <p className="text-sm text-slate-500 font-mono animate-pulse">Scanning Grid Frequencies...</p>
            </div>
          ) : filteredIssues.length > 0 ? (
            <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                   hidden: { opacity: 0 },
                   show: {
                     opacity: 1,
                     transition: {
                       staggerChildren: 0.1
                     }
                   }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8"
            >
              {filteredIssues.slice(0, 12).map((issue) => (
                <motion.div 
                   key={issue._id || issue.id}
                   variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                   }}
                >
                    <IssueCard issue={issue} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
             <div className="text-center py-20 bg-[#0B1221]/50 rounded-3xl border border-white/5 border-dashed">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-500/50" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Sector Status: Nominal</h3>
               <p className="text-slate-500 max-w-sm mx-auto mb-8">No active anomalies detected in your immediate vicinity.</p>
               <Link to="/report" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg">
                  Submit Manual Report
               </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;