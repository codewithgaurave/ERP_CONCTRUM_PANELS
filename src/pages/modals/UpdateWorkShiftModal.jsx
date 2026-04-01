// src/components/modals/UpdateWorkShiftModal.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import workShiftAPI from "../../apis/workShiftAPI";
import { X, Clock } from "lucide-react";

const UpdateWorkShiftModal = ({ isOpen, onClose, shift, onWorkShiftUpdated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    status: "Active"
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || "",
        startTime: shift.startTime || "09:00",
        endTime: shift.endTime || "17:00",
        status: shift.status || "Active"
      });
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDuration = () => {
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Shift name is required");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError("Both start time and end time are required");
      return;
    }

    // Validate time logic
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    if (totalMinutes === 0) {
      setError("Start time and end time cannot be the same");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const { data } = await workShiftAPI.update(shift._id, formData);
      onWorkShiftUpdated();
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating work shift");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      status: "Active"
    });
    setError("");
    onClose();
  };

  if (!isOpen || !shift) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg shadow-xl w-full max-w-md"
        style={{ 
          backgroundColor: themeColors.surface,
          border: `1px solid ${themeColors.border}`
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock size={20} />
            Update Work Shift
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

          <div>
            <label className="block text-sm font-medium mb-2">Shift Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter shift name"
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
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
              <label className="block text-sm font-medium mb-2">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
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

          {/* Duration Display */}
          <div className="p-3 rounded-lg border text-center" style={{ 
            backgroundColor: themeColors.background + '50', 
            borderColor: themeColors.border 
          }}>
            <div className="text-sm" style={{ color: themeColors.textSecondary }}>Shift Duration</div>
            <div className="text-lg font-semibold" style={{ color: themeColors.primary }}>
              {calculateDuration()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg border font-medium transition-colors hover:opacity-90"
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
              <Clock size={16} />
              {loading ? "Updating..." : "Update Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateWorkShiftModal;