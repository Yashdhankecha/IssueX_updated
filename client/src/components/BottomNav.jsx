import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Plus, User, Bell, BarChart3, AlertCircle, Users, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const BottomNav = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotification();

  const isActive = (path) => {
    if (!path) return false;
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const adminNavItems = [
    { name: 'Overview', href: '/admin?tab=overview', icon: BarChart3 },
    { name: 'Issues', href: '/admin?tab=issues', icon: AlertCircle },
    { name: 'Users', href: '/admin?tab=users', icon: Users },
    { name: 'Logout', icon: LogOut, onClick: logout },
  ];

  const userNavItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Report', href: '/report', icon: Plus, isFab: true },
    { name: 'Impact', href: '/impact', icon: Sparkles },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const govNavItems = [
    { name: 'Home', href: '/gov-dashboard', icon: BarChart3 },
    { name: 'Issues', href: '/gov-issues', icon: AlertCircle },
    { name: 'Map', href: '/gov-map', icon: Map },
    { name: 'Notify', href: '/gov-notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile', href: '/gov-profile', icon: User },
  ];

  const isGovernment = user?.role === 'government';
  const navItems = isAdmin ? adminNavItems : (isGovernment ? govNavItems : userNavItems);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 py-2 px-4 z-[60] lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.isFab) {
             return (
              <div key={item.name} className="relative -top-6">
                 <Link
                  to={item.href}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform"
                >
                  <Icon size={28} />
                </Link>
              </div>
             );
          }

          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex flex-col items-center space-y-1 p-2 min-w-[64px] text-red-500 hover:text-red-600"
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium text-red-500">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center space-y-1 p-2 min-w-[64px] ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iPhone home indicator */}
      <div className="h-1 w-full" /> 
    </div>
  );
};

export default BottomNav;
