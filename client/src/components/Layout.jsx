import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LocationPrompt from './LocationPrompt';

import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { selectedLocation, locationPermission } = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show location prompt if no location is set (only for non-admin users)
  if (!isAdmin && !selectedLocation && locationPermission !== 'denied') {
    return <LocationPrompt />;
  }

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20 lg:pb-0">
      {/* Navbar */}
      <Navbar onMenuClick={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Only show for non-admin users */}
        {!isAdmin && (
          <AnimatePresence>
            {sidebarOpen && (
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
            )}
          </AnimatePresence>
        )}
        
        {/* Main Content Area */}
        <motion.main 
          className="flex-1 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {children}
        </motion.main>
      </div>
      
      {/* Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout; 