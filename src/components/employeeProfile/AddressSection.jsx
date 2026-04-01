// src/components/employeeProfile/AddressSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AddressSection = ({ employee, onUpdate, canEdit = false }) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    street: employee?.address?.street || '',
    city: employee?.address?.city || '',
    state: employee?.address?.state || '',
    country: employee?.address?.country || 'India',
    pincode: employee?.address?.pincode || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate({ address: formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      street: employee?.address?.street || '',
      city: employee?.address?.city || '',
      state: employee?.address?.state || '',
      country: employee?.address?.country || 'India',
      pincode: employee?.address?.pincode || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: themeColors.text }}
        >
          Address Information
        </h2>
        {canEdit && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: isEditing ? themeColors.danger : themeColors.primary,
              color: themeColors.surface
            }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Street Address
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              PIN Code
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>
        </div>

        {isEditing && (
          <div 
            className="flex justify-end space-x-4 pt-6 border-t"
            style={{ borderColor: themeColors.border }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: themeColors.primary }}
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddressSection;