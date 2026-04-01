// src/utils/locationUtils.js

// Google Maps API configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_MAP_API_KEY,
  mapId: import.meta.env.VITE_MAP_ID
};

/**
 * Get current user location using browser's Geolocation API with Google Maps enhancement
 * @returns {Promise<{latitude: number, longitude: number, address: string}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log(position)
        try {
          const { latitude, longitude, accuracy } = position.coords;
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          if (isGoogleMapsConfigured()) {
            // Reverse geocode only for display
            address = await googleReverseGeocode(latitude, longitude);
          }

          resolve({ latitude, longitude, accuracy, timestamp: position.timestamp, address });
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

/**
 * Watch user's location in real-time
 * Calls `onUpdate` whenever location changes
 * Returns a watcher ID (can be used to clear with navigator.geolocation.clearWatch)
 */
export const watchLocation = (onUpdate, onError) => {
  if (!navigator.geolocation) {
    onError && onError(new Error('Geolocation not supported'));
    return null;
  }

  const watcherId = navigator.geolocation.watchPosition(
    async (position) => {
      try {
        const { latitude, longitude, accuracy } = position.coords;
        let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (isGoogleMapsConfigured()) {
          address = await googleReverseGeocode(latitude, longitude);
        }
        onUpdate({ latitude, longitude, accuracy, timestamp: position.timestamp, address });
      } catch (err) {
        onError && onError(err);
      }
    },
    (error) => {
      let errorMessage = 'Unable to get location';
      switch (error.code) {
        case error.PERMISSION_DENIED: errorMessage = 'Location access denied'; break;
        case error.POSITION_UNAVAILABLE: errorMessage = 'Position unavailable'; break;
        case error.TIMEOUT: errorMessage = 'Location request timed out'; break;
      }
      onError && onError(new Error(errorMessage));
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );

  return watcherId;
};

/**
 * Stop watching location
 */
export const clearWatchLocation = (watcherId) => {
  if (watcherId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watcherId);
  }
};


/**
 * Reverse geocode coordinates to get address using Google Maps Geocoding API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const googleReverseGeocode = async (latitude, longitude) => {
  try {
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_CONFIG.apiKey}`
    );
    
    if (!response.ok) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    // Any error status — silently fallback to coordinates
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

/**
 * Get precise location using Google Maps Geolocation API (requires additional permissions)
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getPreciseGoogleLocation = async () => {
  try {
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    // This would use Google's Geolocation API which uses WiFi, cell towers, and IP address
    // Note: This API requires additional setup and may not be necessary for most use cases
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_MAPS_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Google Geolocation API request failed');
    }

    const data = await response.json();
    
    if (data.location) {
      return {
        latitude: data.location.lat,
        longitude: data.location.lng,
        accuracy: data.accuracy
      };
    } else {
      throw new Error('No location data received from Google');
    }
  } catch (error) {
    console.error('Google precise location failed:', error);
    // Fallback to browser geolocation
    return getCurrentLocation();
  }
};

/**
 * Get address suggestions using Google Places Autocomplete
 * @param {string} input 
 * @returns {Promise<Array<{description: string, place_id: string}>>}
 */
export const getAddressSuggestions = async (input) => {
  try {
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    if (!input || input.length < 3) {
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_CONFIG.apiKey}&types=establishment|geocode`
    );
    
    if (!response.ok) {
      throw new Error('Places API request failed');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map(prediction => ({
        description: prediction.description,
        place_id: prediction.place_id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Google Places autocomplete failed:', error);
    return [];
  }
};

/**
 * Get place details by place_id
 * @param {string} placeId 
 * @returns {Promise<{address: string, coordinates: {lat: number, lng: number}}>}
 */
export const getPlaceDetails = async (placeId) => {
  try {
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_CONFIG.apiKey}&fields=name,formatted_address,geometry`
    );
    
    if (!response.ok) {
      throw new Error('Place Details API request failed');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return {
        address: data.result.formatted_address,
        coordinates: {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        }
      };
    }
    
    throw new Error('Place details not found');
  } catch (error) {
    console.error('Google Place details failed:', error);
    throw error;
  }
};

/**
 * Validate coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Format coordinates for display
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} precision 
 * @returns {string}
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return 'Invalid coordinates';
  }
  
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(precision)}°${latDirection}, ${Math.abs(lng).toFixed(precision)}°${lngDirection}`;
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number}
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Check if Google Maps APIs are configured
 * @returns {boolean}
 */
export const isGoogleMapsConfigured = () => {
  return !!(GOOGLE_MAPS_CONFIG.apiKey && GOOGLE_MAPS_CONFIG.apiKey !== 'undefined');
};