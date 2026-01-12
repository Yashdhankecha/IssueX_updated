import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Default location for development (New York City)
const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.0060 };

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(parseInt(localStorage.getItem('searchRadius')) || 3); // Default 3km radius

  // Get user's current location on mount
  useEffect(() => {
    // Check if we have a recent cached location first
    const savedLocation = localStorage.getItem('userLocation');
    const savedTimestamp = localStorage.getItem('locationTimestamp');
    
    if (savedLocation && savedTimestamp) {
      try {
        const location = JSON.parse(savedLocation);
        const timestamp = parseInt(savedTimestamp);
        const isRecent = Date.now() - timestamp < 60 * 60 * 1000; // 1 hour
        
        if (isRecent && location.lat && location.lng) {
          setUserLocation(location);
          setSelectedLocation(location);
          setLocationPermission('granted');
          setLocationLoading(false);
          console.log('Using cached location');
          return;
        }
      } catch (e) {
        console.error('Error parsing cached location:', e);
      }
    }
    
    // If no valid cache, request fresh location
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        await handleLocationFallback('Geolocation not supported');
        return;
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (window.location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        console.warn('Geolocation requires HTTPS or localhost');
        await handleLocationFallback('Secure connection required for location access');
        return;
      }

      // Get current position with improved error handling
      const position = await new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: false, // Use false for faster response
          timeout: 15000, // Increased timeout
          maximumAge: 300000, // 5 minutes cache
        };
        
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          options
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || 
          latitude < -90 || latitude > 90 || 
          longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates received');
      }
      
      // Get address name
      let address = 'Current Location';
      try {
          address = await getAddressFromCoords(latitude, longitude);
      } catch (addrErr) {
          console.warn('Could not fetch address for location:', addrErr);
      }

      const location = { lat: latitude, lng: longitude, accuracy, town: address, address };
      
      setUserLocation(location);
      setSelectedLocation(location);
      setLocationPermission('granted');
      
      // Store in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify(location));
      localStorage.setItem('locationTimestamp', Date.now().toString());
      
      toast.success(`Location detected (±${Math.round(accuracy)}m accuracy)`);
    } catch (error) {
      console.error('Location error:', error);
      await handleLocationError(error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationError = async (error) => {
    let message = 'Unable to get your location';
    
    if (error.code) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationPermission('denied');
          message = 'Location permission denied';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out';
          break;
        default:
          message = 'Location service error';
      }
    }
    
    await handleLocationFallback(message);
  };

  const handleLocationFallback = async (reason) => {
    console.log(`Using location fallback: ${reason}`);
    
    // Try to get location from localStorage first
    const savedLocation = localStorage.getItem('userLocation');
    const savedTimestamp = localStorage.getItem('locationTimestamp');
    
    if (savedLocation && savedTimestamp) {
      try {
        const location = JSON.parse(savedLocation);
        const timestamp = parseInt(savedTimestamp);
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent && location.lat && location.lng) {
          setUserLocation(location);
          setSelectedLocation(location);
          setLocationPermission('granted');
          toast.info('Using saved location');
          return;
        }
      } catch (e) {
        console.error('Error parsing saved location:', e);
        localStorage.removeItem('userLocation');
        localStorage.removeItem('locationTimestamp');
      }
    }
    
    // Fall back to default location
    setUserLocation(DEFAULT_LOCATION);
    setSelectedLocation(DEFAULT_LOCATION);
    setLocationPermission('denied');
    localStorage.setItem('userLocation', JSON.stringify(DEFAULT_LOCATION));
    localStorage.setItem('locationTimestamp', Date.now().toString());
    
    toast.info(`${reason}. Using default location (NYC) for demo`);
  };

  const requestLocationPermission = async () => {
    try {
      // Check if permissions API is supported
      if (!navigator.permissions) {
        console.warn('Permissions API not supported, attempting direct geolocation');
        await getCurrentLocation();
        return;
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        setLocationPermission('granted');
        await getCurrentLocation();
      } else if (permission.state === 'prompt') {
        setLocationPermission('prompt');
        await getCurrentLocation();
      } else {
        setLocationPermission('denied');
        await handleLocationFallback('Location permission denied');
      }
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
        if (permission.state === 'granted') {
          getCurrentLocation();
        } else if (permission.state === 'denied') {
          handleLocationFallback('Location permission denied');
        }
      });
    } catch (error) {
      console.error('Permission request error:', error);
      await handleLocationFallback('Permission check failed');
    }
  };

  const updateSelectedLocation = (location) => {
    setSelectedLocation(location);
  };

  const updateRadius = (newRadius) => {
    setRadius(newRadius);
    localStorage.setItem('searchRadius', newRadius);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isWithinRadius = (issueLocation) => {
    if (!selectedLocation || !issueLocation) return false;
    
    const distance = calculateDistance(
      selectedLocation.lat,
      selectedLocation.lng,
      issueLocation.lat,
      issueLocation.lng
    );
    
    return distance <= radius;
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      // First, try our server-side proxy (no CORS issues)
      try {
        const response = await api.get('/api/geocode/reverse', {
          params: { lat, lng }
        });
        
        if (response.data.success) {
          return response.data.data.address;
        }
      } catch (proxyError) {
        console.log('Server proxy geocoding failed, trying direct methods:', proxyError.message);
      }
      
      // Fallback to direct API calls
      const simpleAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      // Try alternative geocoding service that supports CORS
      try {
        // Rate limit: max 1 request per second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          {
            headers: {
              'User-Agent': 'IssueXApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && (data.locality || data.city || data.principalSubdivision)) {
            const addressParts = [];
            if (data.locality) addressParts.push(data.locality);
            if (data.city && data.city !== data.locality) addressParts.push(data.city);
            if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
            if (data.countryName) addressParts.push(data.countryName);
            
            return addressParts.length > 0 ? addressParts.join(', ') : simpleAddress;
          }
        }
      } catch (geocodeError) {
        console.log('Direct geocoding service failed, using coordinates:', geocodeError.message);
      }
      
      // Final fallback to coordinate-based address
      return simpleAddress;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const getCoordsFromAddress = async (address) => {
    try {
      // First, try our server-side proxy (no CORS issues)
      try {
        const response = await api.get('/api/geocode/forward', {
          params: { address }
        });
        
        if (response.data.success) {
          return response.data.data;
        }
      } catch (proxyError) {
        console.log('Server proxy geocoding failed, trying direct methods:', proxyError.message);
      }
      
      // Rate limit: max 1 request per second  
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try multiple geocoding services for better reliability
      const geocodingServices = [
        // Service 1: BigDataCloud (free, CORS-enabled)
        async () => {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`,
            {
              headers: {
                'User-Agent': 'IssueXApp/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.results && data.results.length > 0) {
              const result = data.results[0];
              return {
                lat: parseFloat(result.latitude),
                lng: parseFloat(result.longitude),
                display_name: result.locality || address,
                accuracy: result.confidence || 0.5
              };
            }
          }
          return null;
        },
        
        // Service 2: Fallback - try to parse if it looks like coordinates
        async () => {
          const coordPattern = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/;
          const match = address.match(coordPattern);
          if (match) {
            return {
              lat: parseFloat(match[1]),
              lng: parseFloat(match[2]),
              display_name: address,
              accuracy: 1.0
            };
          }
          return null;
        }
      ];
      
      // Try each service in order
      for (const service of geocodingServices) {
        try {
          const result = await service();
          if (result && !isNaN(result.lat) && !isNaN(result.lng)) {
            return result;
          }
        } catch (serviceError) {
          console.log('Geocoding service failed:', serviceError.message);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  const refreshLocation = async () => {
    // Force refresh the current location
    localStorage.removeItem('userLocation');
    localStorage.removeItem('locationTimestamp');
    await getCurrentLocation();
  };

  const clearLocationCache = () => {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('locationTimestamp');
    setUserLocation(null);
    setSelectedLocation(null);
    setLocationPermission('prompt');
  };

  const value = {
    userLocation,
    selectedLocation,
    locationPermission,
    locationLoading,
    radius,
    getCurrentLocation,
    requestLocationPermission,
    refreshLocation,
    clearLocationCache,
    updateSelectedLocation,
    updateRadius,
    calculateDistance,
    isWithinRadius,
    getAddressFromCoords,
    getCoordsFromAddress,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 