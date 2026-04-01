// src/components/employeeProfile/BasicInfoSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const BasicInfoSection = ({ employee, onUpdate, canEdit = false }) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  // Debug log
  console.log('🔍 BasicInfoSection - canEdit prop:', canEdit);
  
  const [formData, setFormData] = useState({
    name: {
      first: employee?.name?.first || '',
      last: employee?.name?.last || ''
    },
    email: employee?.email || '',
    mobile: employee?.mobile || '',
    alternateMobile: employee?.alternateMobile || '',
    whatsappNumber: employee?.whatsappNumber || '',
    gender: employee?.gender || '',
    dob: employee?.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
    personalEmail: employee?.personalEmail || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating basic info:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: {
        first: employee?.name?.first || '',
        last: employee?.name?.last || ''
      },
      email: employee?.email || '',
      mobile: employee?.mobile || '',
      alternateMobile: employee?.alternateMobile || '',
      whatsappNumber: employee?.whatsappNumber || '',
      gender: employee?.gender || '',
      dob: employee?.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
      personalEmail: employee?.personalEmail || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Basic Information</h2>
        {canEdit && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: themeColors.primary }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="name.first"
              value={formData.name.first}
              onChange={handleChange}
              disabled={!isEditing || !canEdit}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="name.last"
              value={formData.name.last}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
              required
            />
          </div>

          {/* Email Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Work Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Email
            </label>
            <input
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
            />
          </div>

          {/* Phone Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Alternate Mobile
            </label>
            <input
              type="tel"
              name="alternateMobile"
              value={formData.alternateMobile}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
            />
          </div>

          {/* Gender and DOB */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text,
                focusRingColor: themeColors.primary
              }}
            />
          </div>
        </div>

        {isEditing && canEdit && (
          <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border rounded-lg transition-colors"
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

export default BasicInfoSection;