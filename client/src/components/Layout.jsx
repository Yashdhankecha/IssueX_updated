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
    <div className="w-full relative overflow-x-hidden min-h-screen bg-[#030712] pb-20 lg:pb-0">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <Navbar onMenuClick={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex relative z-10">
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
      <div className="hidden lg:block relative z-10">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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