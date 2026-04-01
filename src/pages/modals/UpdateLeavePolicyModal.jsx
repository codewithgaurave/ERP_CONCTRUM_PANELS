// src/components/modals/UpdateLeavePolicyModal.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import leavePolicyAPI from "../../apis/leavePolicyAPI";
import { X } from "lucide-react";

const UpdateLeavePolicyModal = ({ isOpen, onClose, policy, onPolicyUpdated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    leaveType: "",
    maxLeavesPerYear: "",
    genderRestriction: "All",
    carryForward: false,
    description: ""
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        leaveType: policy.leaveType || "",
        maxLeavesPerYear: policy.maxLeavesPerYear?.toString() || "",
        genderRestriction: policy.genderRestriction || "All",
        carryForward: policy.carryForward || false,
        description: policy.description || ""
      });
    }
  }, [policy]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leaveType.trim()) {
      setError("Leave type is required");
      return;
    }

    if (!formData.maxLeavesPerYear || formData.maxLeavesPerYear <= 0) {
      setError("Max leaves per year must be a positive number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const payload = {
        ...formData,
        maxLeavesPerYear: parseInt(formData.maxLeavesPerYear)
      };

      const { data } = await leavePolicyAPI.update(policy._id, payload);
      onPolicyUpdated();
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating leave policy");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      leaveType: "",
      maxLeavesPerYear: "",
      genderRestriction: "All",
      carryForward: false,
      description: ""
    });
    setError("");
    onClose();
  };

  if (!isOpen || !policy) return null;

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
          <h2 className="text-xl font-semibold">Update Leave Policy</h2>
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
            <label className="block text-sm font-medium mb-2">Leave Type *</label>
            <input
              type="text"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              placeholder="Enter leave type (e.g., Sick, Casual, Maternity)"
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
            <label className="block text-sm font-medium mb-2">Max Leaves Per Year *</label>
            <input
              type="number"
              name="maxLeavesPerYear"
              value={formData.maxLeavesPerYear}
              onChange={handleChange}
              placeholder="Enter maximum leaves per year"
              min="1"
              max="365"
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
            <label className="block text-sm font-medium mb-2">Gender Restriction</label>
            <select
              name="genderRestriction"
              value={formData.genderRestriction}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male Only</option>
              <option value="Female">Female Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="carryForward"
              checked={formData.carryForward}
              onChange={handleChange}
              className="w-4 h-4 rounded border transition-colors focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: formData.carryForward ? themeColors.primary : themeColors.background,
                borderColor: themeColors.border
              }}
            />
            <label className="text-sm font-medium">Allow Carry Forward to Next Year</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter policy description"
              rows="3"
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
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
              className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: themeColors.primary }}
            >
              {loading ? "Updating..." : "Update Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLeavePolicyModal;