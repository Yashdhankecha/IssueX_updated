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
  Cloud,
  Navigation
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
  const [weatherIcon, setWeatherIcon] = useState(<Sun size={24} className="text-yellow-500" />);

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
             if(data.current.is_day === 0) setWeatherIcon(<Moon size={24} className="text-slate-600" />);
             else setWeatherIcon(<Sun size={24} className="text-yellow-500" />);
          }
       } catch(e) { console.error('Weather error:', e); }
    };
    fetchWeather();
  }, [selectedLocation]);

  const categories = [
    { value: 'all', label: 'All', icon: Activity },
    { value: 'roads', label: 'Roads', icon: Map },
    { value: 'garbage', label: 'Garbage', icon: AlertCircle },
    { value: 'water', label: 'Water', icon: Activity },
    { value: 'streetlights', label: 'Lights', icon: Clock },
    { value: 'safety', label: 'Safety', icon: Shield },
  ];

  const statusStats = [
    { label: 'Total Issues', count: stats.total, color: 'bg-blue-50 text-blue-600', icon: Activity },
    { label: 'Resolved', count: stats.resolved, color: 'bg-green-50 text-green-600', icon: CheckCircle },
    { label: 'In Progress', count: stats.inProgress, color: 'bg-yellow-50 text-yellow-600', icon: Clock },
    { label: 'Reported', count: stats.reported, color: 'bg-red-50 text-red-600', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 lg:pb-8 font-sans selection:bg-blue-100 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* --- Mobile Sticky Header --- */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-all duration-300 w-full">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden border border-slate-100">
               {user?.profilePicture ? (
                 <img 
                   src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 user?.name?.charAt(0) || 'U'
               )}
            </div>
            <div>
               <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {greeting}, {user?.name?.split(' ')[0] || 'Neighbor'}
               </h1>
               <div className="flex items-center text-xs text-slate-500">
                  <MapPin size={10} className="mr-0.5" />
                  <span className="truncate max-w-[150px]">
                     {weather.location !== 'Bengaluru' ? weather.location : (selectedLocation?.town || selectedLocation || 'Locating...')} 
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center space-x-2">
            <Link to="/notifications" className="p-2 text-slate-600 relative">
               <Bell size={24} />
               {unreadCount > 0 && (
                   <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               )}
            </Link>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6 lg:space-y-10">
      
        {/* --- Desktop Header & Weather --- */}
        <div className="hidden lg:flex items-end justify-between mb-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-2"
            >
               <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name?.split(' ')[0]}</span> 👋
               </h1>
               <p className="text-lg text-slate-600">
                  Making our community better, one report at a time.
               </p>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200"
            >
                {weatherIcon}
                <span className="font-semibold text-slate-700">{weather.temp}°C</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 text-sm">{weather.location}</span>
            </motion.div>
        </div>

        {/* --- Hero / CTA Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl lg:shadow-2xl shadow-blue-500/20"
        >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 px-4 py-6 lg:px-10 lg:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-4 max-w-lg">
                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/10">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Live Updates Enabled
                   </div>
                   <h2 className="text-2xl lg:text-4xl font-bold leading-tight">
                      Spot an issue in your area? <br/>
                      Report it instantly.
                   </h2>
                   <p className="text-blue-100 text-sm lg:text-lg">
                      Help authorized local bodies fix roads, lights, and water issues faster.
                   </p>
                   <Link 
                      to="/report" 
                      className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm lg:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                   >
                      Report New Issue <Plus size={18} className="ml-2" />
                   </Link>
                </div>
                
                <div className="hidden md:block">
                    {/* Abstract Grid Graphic */}
                    <div className="grid grid-cols-2 gap-3 opacity-80 rotate-3 transform hover:rotate-6 transition-transform duration-500">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <MapPin size={32} className="text-white" />
                        </div>
                         <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 translate-y-4">
                            <AlertCircle size={32} className="text-white" />
                        </div>
                         <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 -translate-y-4">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                         <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Activity size={32} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* --- Search & Filter Bar --- */}
        <div className="sticky top-[60px] lg:top-4 z-30 bg-slate-50/95 backdrop-blur-md pb-4 pt-2 lg:mx-0 lg:px-0 lg:bg-transparent lg:backdrop-blur-none lg:static">
             <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search issues, locations, or IDs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none shadow-sm transition-all"
                    />
                </div>
                
                {/* Categories */}
                <div className="flex gap-1 overflow-x-auto overflow-y-hidden pb-2 lg:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilters({ category: cat.value })}
                      className={`flex-shrink-0 px-2.5 lg:px-5 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl text-[11px] lg:text-sm font-medium transition-all whitespace-nowrap border flex items-center space-x-1 ${
                        filters?.category === cat.value
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat.icon && <cat.icon size={12} className={filters?.category === cat.value ? 'text-blue-300' : 'text-slate-400'} />}
                      <span>{cat.label}</span>
                    </button>
                  ))}
               </div>
             </div>
        </div>

        {/* --- Stats Grid --- */}
        <div>
           <h3 className="text-sm lg:text-base font-bold text-slate-800 mb-4 px-1 flex items-center">
              <Activity size={16} className="mr-2 text-blue-600" />
              Community Overview
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {statusStats.map((stat, i) => (
                 <motion.div 
                    key={i} 
                    whileHover={{ y: -4 }}
                    className="bg-white p-3 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-24 lg:h-32 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                 >
                     <div className={`absolute top-0 right-0 p-3 opacity-10 ${stat.color.split(' ')[1]}`}>
                        <stat.icon size={64} />
                     </div>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon size={20} />
                     </div>
                     <div>
                        <span className="text-2xl lg:text-4xl font-extrabold text-slate-900 block tracking-tight">{stat.count}</span>
                        <span className="text-xs lg:text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</span>
                     </div>
                 </motion.div>
              ))}
           </div>
        </div>

        {/* --- Recent Activity Grid --- */}
        <div className="pb-4 lg:pb-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center">
               <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
               Recent Activity
            </h3>
            <Link to="/map" className="group text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700 transition-colors">
               View Map <Navigation size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-blue-500/30"></div>
              <p className="text-sm text-slate-500 font-medium animate-pulse">Finding nearby reports...</p>
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
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={40} className="text-green-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">All Clear in your area!</h3>
               <p className="text-slate-500 max-w-sm mx-auto mb-8">No open issues reported nearby. Be the first to report if you see something!</p>
               <Link to="/report" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
                  Report an Issue
               </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;