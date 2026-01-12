import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Globe, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const LocationPrompt = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const { 
    getCurrentLocation, 
    requestLocationPermission, 
    locationPermission, 
    userLocation,
    getCoordsFromAddress,
    updateSelectedLocation,
    refreshLocation,
    clearLocationCache
  } = useLocation();

  // Auto-hide prompt if location is already available
  useEffect(() => {
    if (userLocation) {
      // Location is available, this component should not be shown
      console.log('Location available, hiding prompt');
    }
  }, [userLocation]);

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    setIsLoading(true);
    try {
      await refreshLocation();
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualAddress.trim()) return;
    
    setIsLoading(true);
    try {
      const coords = await getCoordsFromAddress(manualAddress);
      if (coords) {
        updateSelectedLocation(coords);
        setShowManualInput(false);
        setManualAddress('');
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      alert('Error finding location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipLocation = () => {
    // Use default location and hide prompt
    updateSelectedLocation({ lat: 40.7128, lng: -74.0060 }); // NYC default
  };

  // Don't show if location is already available
  if (userLocation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        className="card p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <MapPin size={32} className="text-primary-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-bold text-secondary-900 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Enable Location Access
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-secondary-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          To help you discover and report civic issues in your area, we need to know your location. 
          This helps us show you relevant issues within your neighborhood.
        </motion.p>

        {/* Permission Status */}
        {locationPermission === 'denied' && (
          <motion.div
            className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-danger-600" />
              <span className="text-sm text-danger-700">
                Location access was denied. You can enable it in browser settings or enter an address manually.
              </span>
            </div>
          </motion.div>
        )}

        {locationPermission === 'granted' && (
          <motion.div
            className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-success-600" />
              <span className="text-sm text-success-700">
                Location access granted! Getting your location...
              </span>
            </div>
          </motion.div>
        )}

        {/* Manual Address Input */}
        {showManualInput && (
          <motion.form
            onSubmit={handleManualLocationSubmit}
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter your address, city, or landmark"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
              disabled={isLoading}
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isLoading || !manualAddress.trim()}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Searching...' : 'Use This Location'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualAddress('');
                }}
                className="btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Action Buttons */}
        {!showManualInput && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleGetLocation}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <Navigation size={16} />
              )}
              <span>
                {isLoading ? 'Getting Location...' : 'Use Current Location'}
              </span>
            </button>

            <button
              onClick={() => setShowManualInput(true)}
              className="w-full btn-outline flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <Globe size={16} />
              <span>Enter Address Manually</span>
            </button>

            {locationPermission === 'denied' && (
              <button
                onClick={handleRefreshLocation}
                disabled={isLoading}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
            )}

            <button
              onClick={handleSkipLocation}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              Skip and use default location (NYC)
            </button>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          className="mt-6 text-xs text-secondary-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Your location is only used to show relevant issues and is not shared with others.</p>
          <p className="mt-1">You can change this setting anytime in your preferences.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LocationPrompt; 