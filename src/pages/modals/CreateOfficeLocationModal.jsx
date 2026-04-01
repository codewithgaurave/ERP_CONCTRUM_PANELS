// src/components/modals/CreateOfficeLocationModal.jsx
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import officeLocationAPI from "../../apis/officeLocationAPI";
import { X, Building, MapPin, Navigation, Search } from "lucide-react";
import { getAddressSuggestions, getPlaceDetails, isGoogleMapsConfigured } from "../../utils/locationUtils";
import LocationButton from "../../components/LocationButton";

const CreateOfficeLocationModal = ({ isOpen, onClose, onOfficeLocationCreated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    officeName: "",
    officeAddress: "",
    latitude: "",
    longitude: "",
    officeType: "Office",
    branchCode: "",
    contactPerson: {
      name: "",
      phone: "",
      email: ""
    }
  });

  // Load Google Maps Places API
  useEffect(() => {
    if (isOpen && isGoogleMapsConfigured() && window.google) {
      // Google Maps Places API is available
      console.log('Google Maps Places API loaded');
    }
  }, [isOpen]);

  const handleLocationSuccess = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      officeAddress: location.address || prev.officeAddress
    }));
    
    // Show accuracy info if available
    if (location.accuracy) {
      console.log(`Location accuracy: ${location.accuracy.toFixed(2)} meters`);
    }
  };

  const handleLocationError = (errorMessage) => {
    setError(errorMessage);
  };

  // Handle address input with debounced suggestions
  const handleAddressInput = async (value) => {
    setFormData(prev => ({ ...prev, officeAddress: value }));
    
    if (value.length > 2 && isGoogleMapsConfigured()) {
      try {
        const suggestions = await getAddressSuggestions(value);
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.warn('Address suggestions failed:', error);
        setAddressSuggestions([]);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    try {
      setLoading(true);
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      
      setFormData(prev => ({
        ...prev,
        officeAddress: placeDetails.address,
        latitude: placeDetails.coordinates.lat.toString(),
        longitude: placeDetails.coordinates.lng.toString()
      }));
      
      setShowSuggestions(false);
      setAddressSuggestions([]);
    } catch (error) {
      setError('Failed to get place details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("contactPerson.")) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else if (name === "officeAddress") {
      handleAddressInput(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.officeName.trim()) {
    setError("Office name is required");
    return;
  }

  if (!formData.officeAddress.trim()) {
    setError("Office address is required");
    return;
  }

  if (!formData.latitude || !formData.longitude) {
    setError("Both latitude and longitude are required");
    return;
  }

  // Validate coordinates
  const lat = parseFloat(formData.latitude);
  const lng = parseFloat(formData.longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    setError("Latitude and longitude must be valid numbers");
    return;
  }

  if (lat < -90 || lat > 90) {
    setError("Latitude must be between -90 and 90");
    return;
  }

  if (lng < -180 || lng > 180) {
    setError("Longitude must be between -180 and 180");
    return;
  }

  try {
    setLoading(true);
    setError("");
    
    // Backend के schema के according data भेजें
    const submitData = {
      officeName: formData.officeName.trim(),
      officeAddress: formData.officeAddress.trim(),
      latitude: lat,  // सीधे latitude
      longitude: lng, // सीधे longitude
      officeType: formData.officeType,
      branchCode: formData.branchCode.trim() || null,
      contactPerson: formData.contactPerson.name.trim() ? {
        name: formData.contactPerson.name.trim(),
        phone: formData.contactPerson.phone.trim() || null,
        email: formData.contactPerson.email.trim() || null
      } : null
    };

    console.log("Submitting office data:", submitData);

    const { data } = await officeLocationAPI.create(submitData);
    
    if (data.success) {
      onOfficeLocationCreated();
      
      // Reset form
      setFormData({
        officeName: "",
        officeAddress: "",
        latitude: "",
        longitude: "",
        officeType: "Office",
        branchCode: "",
        contactPerson: {
          name: "",
          phone: "",
          email: ""
        }
      });
      
      handleClose();
    } else {
      setError(data.message || "Failed to create office location");
    }
      
  } catch (err) {
    console.log("Error response:", err.response);
    
    // Better error handling
    if (err.response?.data?.errors) {
      setError(err.response.data.errors.join(', '));
    } else {
      setError(err.response?.data?.message || err.message || "Error creating office location");
    }
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setFormData({
      officeName: "",
      officeAddress: "",
      latitude: "",
      longitude: "",
      officeType: "Office",
      branchCode: "",
      contactPerson: {
        name: "",
        phone: "",
        email: ""
      }
    });
    setError("");
    setAddressSuggestions([]);
    setShowSuggestions(false);
    onClose();
  };

  // Open Google Maps with coordinates
  const openInGoogleMaps = () => {
    if (formData.latitude && formData.longitude) {
      const url = `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&ll=${formData.latitude},${formData.longitude}&z=15`;
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: themeColors.surface,
          border: `1px solid ${themeColors.border}`
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-inherit" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building size={20} />
            Create New Office Location
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full transition-colors hover:opacity-70"
            style={{ color: themeColors.text }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: themeColors.danger + '20',
                color: themeColors.danger
              }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Office Name *</label>
              <input
                type="text"
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="Enter office name"
                className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Office Type</label>
              <select
                name="officeType"
                value={formData.officeType}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              >
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Office Address *</label>
            <div className="relative">
              <textarea
                ref={addressInputRef}
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
                placeholder="Enter complete office address or search for a location"
                rows="3"
                className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none pr-10"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
                required
              />
              <Search 
                size={16} 
                className="absolute right-3 top-3 opacity-50"
                style={{ color: themeColors.text }}
              />
            </div>
            
            {/* Address Suggestions */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div 
                className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
                style={{ 
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border
                }}
              >
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full p-3 text-left hover:opacity-90 transition-colors border-b text-sm"
                    style={{ 
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coordinates Section with Location Button */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Coordinates *</label>
              <LocationButton
                onLocationSuccess={handleLocationSuccess}
                onLocationError={handleLocationError}
                buttonText="Get Current Location"
                size="small"
                variant="primary"
                showAccuracy={true}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 40.7128"
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Coordinates Preview */}
          {(formData.latitude && formData.longitude) && (
            <div className="p-3 rounded-lg border text-center" style={{ 
              backgroundColor: themeColors.background + '50', 
              borderColor: themeColors.border 
            }}>
              <div className="text-sm" style={{ color: themeColors.textSecondary }}>Coordinates Preview</div>
              <div className="text-sm font-mono mt-1">
                {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </div>
              <button
                type="button"
                onClick={openInGoogleMaps}
                className="flex items-center gap-1 text-xs mt-2 mx-auto transition-colors hover:opacity-70"
                style={{ color: themeColors.primary }}
              >
                <Navigation size={12} />
                View on Google Maps
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Branch Code (Optional)</label>
            <input
              type="text"
              name="branchCode"
              value={formData.branchCode}
              onChange={handleChange}
              placeholder="Enter branch code if applicable"
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>

          <div className="border-t pt-4" style={{ borderColor: themeColors.border }}>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin size={16} />
              Contact Person (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={handleChange}
                  placeholder="Contact person name"
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg border font-medium transition-colors hover:opacity-90 max-sm:hidden"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Building size={16} />
              {loading ? "Creating..." : "Create Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfficeLocationModal;