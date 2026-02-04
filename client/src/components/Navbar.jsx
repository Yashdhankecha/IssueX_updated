import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  User,
  Settings,
  LogOut,
  Bell,
  Plus,
  Map,
  Home,
  Shield,
  Sparkles,
  BarChart3,
  AlertCircle,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useIssue } from '../contexts/IssueContext';
import { useNotification } from '../contexts/NotificationContext';

const Navbar = ({ onMenuClick }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [radiusOpen, setRadiusOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { selectedLocation, radius, updateRadius } = useLocationContext();
  const { updateFilters } = useIssue();
  const { unreadCount } = useNotification();
  const location = useLocation();

  const isGovernment = user?.role === 'government';
  const isManager = user?.role === 'manager';
  const isWorker = user?.role === 'field_worker';

  let navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Impact', href: '/impact', icon: Sparkles },
    { name: 'Report', href: '/report', icon: Plus },
  ];

  if (isAdmin) {
    navigation = [
      { name: 'Overview', href: '/admin?tab=overview', icon: BarChart3 },
      { name: 'Issues', href: '/admin?tab=issues', icon: AlertCircle },
      { name: 'Users', href: '/admin?tab=users', icon: Users },
    ];
  } else if (isManager) {
    navigation = [
      { name: 'Dashboard', href: '/manager-dashboard', icon: BarChart3 },
      { name: 'Map', href: '/gov-map', icon: MapPin },
    ];
  } else if (isGovernment) {
    navigation = [
      { name: 'Dashboard', href: '/gov-dashboard', icon: BarChart3 },
      { name: 'Issues', href: '/gov-issues', icon: AlertCircle },
      { name: 'Map', href: '/gov-map', icon: MapPin },
    ];
  } else if (isWorker) {
    navigation = [
       { name: 'My Tasks', href: '/worker-dashboard?view=list', icon: BarChart3 },
       { name: 'Task Map', href: '/worker-dashboard?view=map', icon: Map },
    ];
  }

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <nav className="hidden lg:block bg-[#0B1221]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-[#0F172A] rounded-xl w-full h-full flex items-center justify-center border border-white/10">
                <Zap size={20} className="text-blue-400" fill="currentColor" />
              </div>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">IssueX</span>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Location Indicator */}
            {!isAdmin && !isManager && !isGovernment && (
              <div className="relative">
                <button
                  onClick={() => setRadiusOpen(!radiusOpen)}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all"
                >
                  <MapPin size={16} className="text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    {selectedLocation ? `${radius}km` : 'Location'}
                  </span>
                </button>

                <AnimatePresence>
                  {radiusOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-[#0B1221]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    >
                      <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Search Radius
                      </div>
                      {[1, 3, 5, 10, 20, 50].map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            updateRadius(r);
                            updateFilters({ radius: r });
                            setRadiusOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${radius === r ? 'text-green-400 font-bold bg-green-500/10' : 'text-slate-300'
                            }`}
                        >
                          <span>{r} km</span>
                          {radius === r && <MapPin size={14} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Notifications */}
            <Link
              to={isGovernment ? "/gov-notifications" : "/notifications"}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-300">
                  {user?.name || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-56 bg-[#0B1221]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>

                    {isAdmin ? (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
                          Admin Tools
                        </div>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to={isGovernment ? "/gov-profile" : "/profile"}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </Link>

                        {!isGovernment && (
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-all"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings size={16} />
                            <span>Settings</span>
                          </Link>
                        )}
                      </>
                    )}

                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;