 // src/components/modals/CreateEmploymentStatusModal.jsx
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import employmentStatusAPI from "../../apis/employmentStatusAPI";
import { X, UserCheck } from "lucide-react";

const CreateEmploymentStatusModal = ({ isOpen, onClose, onEmploymentStatusCreated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Active"
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
    
    if (!formData.title.trim()) {
      setError("Employment status title is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const { data } = await employmentStatusAPI.create(formData);
      onEmploymentStatusCreated();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "Active"
      });
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error creating employment status");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "Active"
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

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
            <UserCheck size={20} />
            Create New Employment Status
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
            <label className="block text-sm font-medium mb-2">Status Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter employment status title (e.g., Probation, Permanent)"
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
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter employment status description"
              rows="3"
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
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
              <UserCheck size={16} />
              {loading ? "Creating..." : "Create Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmploymentStatusModal;