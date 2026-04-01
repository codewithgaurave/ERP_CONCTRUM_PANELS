import { useState, useEffect } from 'react';
import { Locate, Loader, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getCurrentLocation, watchLocation, clearWatchLocation, isGoogleMapsConfigured } from '../utils/locationUtils';

const LocationButton = ({ onLocationSuccess, onLocationError, buttonText = "Get Current Location", size = "default", variant = "primary", showAccuracy = true, className = "" }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [watcherId, setWatcherId] = useState(null);

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      if (!isGoogleMapsConfigured()) console.warn('Google Maps API not configured.');

      const location = await getCurrentLocation();
      onLocationSuccess && onLocationSuccess(location);

      if (showAccuracy && location.accuracy) {
        console.log(`Location accuracy: ${location.accuracy.toFixed(2)} meters`);
      }
    } catch (err) {
      onLocationError && onLocationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Start watching location in real-time
  const startWatching = () => {
    if (watcherId) return; // already watching
    const id = watchLocation(
      (location) => onLocationSuccess && onLocationSuccess(location),
      (err) => onLocationError && onLocationError(err.message)
    );
    setWatcherId(id);
  };

  const stopWatching = () => {
    clearWatchLocation(watcherId);
    setWatcherId(null);
  };

  useEffect(() => {
    return () => stopWatching(); // cleanup on unmount
  }, []);

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 transition-all duration-200 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";
    const sizeStyles = { small: "px-3 py-2 text-sm", default: "px-4 py-2 text-sm", large: "px-6 py-3 text-base" };
    const variantStyles = { primary: `text-white hover:opacity-90`, secondary: `border hover:opacity-90`, outline: `border bg-transparent hover:opacity-90` };
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className={getButtonStyles()}
        style={{ backgroundColor: variant === 'primary' ? themeColors.primary : 'transparent', borderColor: themeColors.border, color: variant === 'primary' ? 'white' : themeColors.text }}
        title="Get your current location using GPS"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : <Locate size={16} />}
        {loading ? "Getting Location..." : buttonText}
      </button>

      {!isGoogleMapsConfigured() && (
        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <MapPin size={12} /> Using basic location services
        </div>
      )}

      {/* Optional start/stop watch buttons */}
      {/* <button onClick={startWatching}>Start Live Tracking</button>
          <button onClick={stopWatching}>Stop Live Tracking</button> */}
    </div>
  );
};

export default LocationButton;
