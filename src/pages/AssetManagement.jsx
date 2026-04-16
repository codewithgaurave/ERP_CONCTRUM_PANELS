import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import assetAPI from "../apis/assetAPI";
import assetCategoryAPI from "../apis/assetCategoryAPI";
import employeeAPI from "../apis/employeeAPI";
import { 
  Plus, Edit, Trash2, Package, User, Calendar, 
  Filter, Download, Eye, UserPlus, RotateCcw, Upload 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AssetManagement = () => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    condition: "",
    page: 1,
    limit: 1000
  });

  // Frontend pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "Piece",
    quantity: 1,
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    condition: "New",
    description: "",
    location: ""
  });

  const units = ['Piece', 'Set', 'Pair', 'Box', 'Pack', 'Unit', 'Meter', 'Kilogram', 'Liter', 'Other'];
  const conditions = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];
  const statuses = ['Available', 'Assigned', 'Under Maintenance', 'Retired'];

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    fetchCategories();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data } = await assetAPI.getAll(filters);
      setAssets(data.assets || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeAPI.getAll({ limit: 100 });
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await assetCategoryAPI.getAll({ isActive: true });
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await assetAPI.update(editingAsset._id, formData);
        Swal.fire({
          title: 'Success!',
          text: 'Asset updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const response = await assetAPI.create(formData);
        const { count, message } = response.data;
        
        Swal.fire({
          title: 'Success!',
          text: message,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      fetchAssets();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving asset");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await assetAPI.delete(id);
        fetchAssets();
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting asset");
      }
    }
  };

  const handleAssign = async (employeeId) => {
    try {
      // Check if asset is already assigned
      const activeAssignments = selectedAsset.assignedTo?.filter(a => a.isActive) || [];
      
      if (activeAssignments.length > 0) {
        const currentEmployee = activeAssignments[0].employee;
        const currentName = `${currentEmployee?.name?.first || ''} ${currentEmployee?.name?.last || ''}`;
        
        // Show SweetAlert confirmation
        const result = await Swal.fire({
          title: 'Asset Already Assigned!',
          html: `
            <div style="text-align: left;">
              <p><strong>${selectedAsset.name}</strong> is currently assigned to:</p>
              <p style="margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                <strong>${currentName}</strong><br/>
                <small>${currentEmployee?.employeeId || ''} - ${currentEmployee?.designation?.title || ''}</small>
              </p>
              <p>Do you want to transfer this asset to another employee?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, Transfer Asset',
          cancelButtonText: 'Cancel'
        });
        
        if (!result.isConfirmed) {
          return;
        }
      }
      
      await assetAPI.assign(selectedAsset._id, employeeId);
      setShowAssignModal(false);
      fetchAssets();
      
      Swal.fire({
        title: 'Success!',
        text: 'Asset assigned successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || "Error assigning asset",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleReturn = async (id) => {
    try {
      await assetAPI.return(id);
      fetchAssets();
    } catch (err) {
      setError(err.response?.data?.message || "Error returning asset");
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await assetAPI.downloadSample();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets_sample_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Error downloading sample file");
    }
  };

  const handleImportExcel = async (file) => {
    try {
      const response = await assetAPI.importFromExcel(file);
      const { results } = response.data;
      
      Swal.fire({
        title: 'Import Complete!',
        html: `
          <div style="text-align: left;">
            <p><strong>Total Records:</strong> ${results.total}</p>
            <p><strong>Successfully Imported:</strong> ${results.success.length}</p>
            <p><strong>Errors:</strong> ${results.errors.length}</p>
            ${results.errors.length > 0 ? `
              <div style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                <strong>Error Details:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  ${results.errors.slice(0, 5).map(error => 
                    `<li>Row ${error.row}: ${error.error}</li>`
                  ).join('')}
                  ${results.errors.length > 5 ? `<li>... and ${results.errors.length - 5} more errors</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>
        `,
        icon: results.errors.length === 0 ? 'success' : 'warning',
        confirmButtonColor: '#3085d6'
      });
      
      setShowImportModal(false);
      fetchAssets();
    } catch (err) {
      Swal.fire({
        title: 'Import Failed!',
        text: err.response?.data?.message || "Error importing Excel file",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await assetAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Error exporting assets");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "Piece",
      quantity: 1,
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: "",
      condition: "New",
      description: "",
      location: ""
    });
    setEditingAsset(null);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category?._id || asset.category,
      unit: asset.unit || "Piece",
      quantity: 1, // Always 1 for editing existing assets
      brand: asset.brand || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : "",
      purchasePrice: asset.purchasePrice || "",
      condition: asset.condition,
      description: asset.description || "",
      location: asset.location || ""
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Available: "bg-green-100 text-green-800",
      Assigned: "bg-blue-100 text-blue-800",
      "Under Maintenance": "bg-yellow-100 text-yellow-800",
      Retired: "bg-red-100 text-red-800"
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`;
  };

  // Frontend pagination calculation
  const totalItems = assets.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;
  const paginatedAssets = assets.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage company assets and assignments
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleDownloadSample}
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: themeColors.success }}
          >
            <Download size={16} />
            Sample Excel
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: themeColors.warning }}
          >
            <Upload size={16} />
            Import Excel
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: themeColors.accent }}
          >
            <Download size={16} />
            Export Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus size={16} />
            Add Asset
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: themeColors.background }}>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Asset ID</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Name</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Category</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Unit</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Status</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Assigned To</th>
              <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.map((asset) => (
              <tr key={asset._id} className="border-b" style={{ borderColor: themeColors.border }}>
                <td className="p-3 text-sm font-medium">{asset.assetId}</td>
                <td className="p-3 text-sm">{asset.name}</td>
                <td className="p-3 text-sm">{asset.category?.name || asset.category}</td>
                <td className="p-3 text-sm">{asset.unit}</td>
                <td className="p-3">
                  <span className={getStatusBadge(asset.status)}>{asset.status}</span>
                </td>
                <td className="p-3 text-sm">
                  {asset.assignedTo && asset.assignedTo.length > 0 ? (
                    <div className="space-y-1">
                      {asset.assignedTo
                        .filter(assignment => assignment.isActive)
                        .map((assignment, index) => (
                          <div key={index} className="text-xs">
                            {assignment.employee?.name?.first} {assignment.employee?.name?.last}
                          </div>
                        ))
                      }
                    </div>
                  ) : '-'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-2 rounded text-white"
                      style={{ backgroundColor: themeColors.primary }}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => { setSelectedAsset(asset); setShowViewModal(true); }}
                      className="p-2 rounded text-white"
                      style={{ backgroundColor: '#6366f1' }}
                      title="View Assignments"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => { setSelectedAsset(asset); setShowAssignModal(true); }}
                      className="p-2 rounded text-white"
                      style={{ backgroundColor: themeColors.success }}
                      title="Assign"
                    >
                      <UserPlus size={14} />
                    </button>
                    {asset.status === 'Assigned' && (
                      <button
                        onClick={() => handleReturn(asset._id)}
                        className="p-2 rounded text-white"
                        style={{ backgroundColor: themeColors.warning }}
                        title="Return All"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(asset._id)}
                      className="p-2 rounded text-white"
                      style={{ backgroundColor: themeColors.danger }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                setItemsPerPage(value === 'all' ? 'all' : parseInt(value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded-md border text-sm"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="all">All</option>
            </select>
            <span className="text-sm">entries</span>
          </div>

          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
          </div>

          {itemsPerPage !== 'all' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                Previous
              </button>
              
              <span className="text-sm px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold">
                {editingAsset ? "Edit Asset" : "Create New Asset(s)"}
              </h2>
              {!editingAsset && (
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  You can create multiple assets at once by specifying quantity
                </p>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                {!editingAsset && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full p-2 rounded-md border text-sm"
                      style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                      placeholder="Enter quantity"
                      required
                    />
                    <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                      Number of assets to create (1-1000)
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                  />
                  {!editingAsset && formData.quantity > 1 && (
                    <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                      Leave empty for bulk creation - each asset will have unique Asset ID
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {editingAsset 
                    ? "Update" 
                    : formData.quantity > 1 
                      ? `Create ${formData.quantity} Assets` 
                      : "Create Asset"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Assignments Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-lg max-w-2xl w-full" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold">Asset Assignments - {selectedAsset?.name}</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>Asset ID: {selectedAsset?.assetId}</p>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>Status: {selectedAsset?.status}</p>
              </div>
              
              {selectedAsset?.assignedTo && selectedAsset.assignedTo.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Assigned Employees:</h3>
                  {selectedAsset.assignedTo
                    .filter(assignment => assignment.isActive)
                    .map((assignment, index) => (
                      <div 
                        key={index}
                        onClick={() => navigate(`/employee-profile/${assignment.employee?._id}`)}
                        className="p-4 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ borderColor: themeColors.border }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {assignment.employee?.name?.first} {assignment.employee?.name?.last}
                            </div>
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                              {assignment.employee?.employeeId} - {assignment.employee?.designation?.title}
                            </div>
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                              Department: {assignment.employee?.department?.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>Assigned:</div>
                            <div className="text-sm">{new Date(assignment.assignedDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: themeColors.textSecondary }}>No active assignments</p>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-lg max-w-md w-full" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold">Assign Asset</h2>
            </div>
            
            <div className="p-6">
              <p className="mb-4">Select employee to assign <strong>{selectedAsset?.name}</strong>:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {employees.map(employee => (
                  <button
                    key={employee._id}
                    onClick={() => handleAssign(employee._id)}
                    className="w-full text-left p-3 rounded border hover:bg-gray-50"
                    style={{ borderColor: themeColors.border }}
                  >
                    <div className="font-medium">{employee.name?.first} {employee.name?.last}</div>
                    <div className="text-sm text-gray-500">{employee.employeeId} - {employee.designation?.title || 'No Designation'}</div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-lg max-w-md w-full" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold">Import Assets from Excel</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>
                  Upload an Excel file to import multiple assets at once.
                </p>
                <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                  Make sure to download the sample template first to see the required format.
                </p>
              </div>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleImportExcel(file);
                  }
                }}
                className="w-full p-2 border rounded-lg"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadSample}
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: themeColors.success }}
                >
                  Download Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;