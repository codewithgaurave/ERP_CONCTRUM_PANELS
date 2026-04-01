// src/components/OfficeLocations.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import officeLocationAPI from "../apis/officeLocationAPI";
import CreateOfficeLocationModal from "./modals/CreateOfficeLocationModal";
import UpdateOfficeLocationModal from "./modals/UpdateOfficeLocationModal";
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Building,
  MapPin,
  Navigation,
  Mail,
  Phone,
  Filter
} from "lucide-react";

const OfficeLocations = () => {
  const { themeColors } = useTheme();
  const [officeLocations, setOfficeLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOfficeLocation, setSelectedOfficeLocation] = useState(null);

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: "",
    officeType: "All",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [stats, setStats] = useState({
    office: 0,
    remote: 0,
    hybrid: 0,
    total: 0
  });

  // Fetch office locations with filters
  const fetchOfficeLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await officeLocationAPI.getAll(filters);
      setOfficeLocations(data.officeLocations || []);
      setPagination(data.pagination || {});
      setStats(data.stats || {});

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching office locations");
      console.error("Fetch office locations error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle sort
  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Delete office location
  const handleDelete = async (id) => {
    const officeLocation = officeLocations.find(loc => loc._id === id);
    if (!officeLocation) return;

    if (!window.confirm(`Are you sure you want to delete the "${officeLocation.officeName}" office location? This action cannot be undone.`)) {
      return;
    }

    try {
      await officeLocationAPI.delete(id);
      // Refresh the list to maintain pagination
      fetchOfficeLocations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting office location");
    }
  };

  // Handle office location creation
  const handleOfficeLocationCreated = () => {
    setShowCreateModal(false);
    fetchOfficeLocations(); // Refresh the list
  };

  // Handle office location update
  const handleOfficeLocationUpdated = () => {
    setShowUpdateModal(false);
    setSelectedOfficeLocation(null);
    fetchOfficeLocations(); // Refresh the list
  };

  // Start editing an office location
  const startEditing = (officeLocation) => {
    setSelectedOfficeLocation(officeLocation);
    setShowUpdateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format created by name
  const formatCreatedByName = (createdBy) => {
    if (!createdBy) return 'N/A';
    return `${createdBy.name?.first} ${createdBy.name?.last}`;
  };

  // Get office type badge style
  const getOfficeTypeBadge = (officeType) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (officeType) {
      case "Office":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Remote":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Hybrid":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      officeType: "All",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <ArrowUpDown size={14} />;
    return filters.sortOrder === "asc" ? "↑" : "↓";
  };

  // Open Google Maps with coordinates
  const openInGoogleMaps = (latitude, longitude, officeName) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchOfficeLocations();
  }, [filters]);

  if (loading && officeLocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: themeColors.text }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Office Locations Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and organize company office locations
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <Filter size={16} />
            Clear Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.primary
            }}
          >
            <Building size={18} />
            + Add Office Location
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.danger + '20', 
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}>
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{stats.total}</div>
          <div className="text-sm">Total Locations</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{stats.office}</div>
          <div className="text-sm">Physical Offices</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{stats.remote}</div>
          <div className="text-sm">Remote Locations</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{stats.hybrid}</div>
          <div className="text-sm">Hybrid Locations</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, address, or branch code..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Office Type</label>
            <select
              value={filters.officeType}
              onChange={(e) => handleFilterChange('officeType', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="All">All Types</option>
              <option value="Office">Office</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="officeName">Name</option>
              <option value="officeType">Type</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Items Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Office Locations Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Office Locations List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {officeLocations.length} of {pagination.totalCount} locations
          </div>
        </div>

        {officeLocations.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <Building size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No office locations found</p>
            <p className="text-sm mb-4">Get started by creating your first office location.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex items-center gap-2 mx-auto"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Building size={18} />
              Create Office Location
            </button>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('officeName')}
                  >
                    <div className="flex items-center gap-1">
                      Office Name
                      <span className="text-xs">{getSortIcon('officeName')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Address</th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Coordinates</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('officeType')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      <span className="text-xs">{getSortIcon('officeType')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Contact Person</th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Created By</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created Date
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officeLocations.map((location) => (
                  <tr 
                    key={location._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm font-medium">
                      <div>
                        {location.officeName}
                        {location.branchCode && (
                          <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                            Code: {location.branchCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="max-w-xs truncate" title={location.officeAddress}>
                        <MapPin size={14} className="inline mr-1" />
                        {location.officeAddress}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {console.log(location)}
                        <div>Lat: {location?.latitude?.toFixed(6)}</div>
                        <div>Lng: {location?.longitude?.toFixed(6)}</div>
                        <button
                          onClick={() => openInGoogleMaps(location?.latitude, location?.longitude, location.officeName)}
                          className="flex items-center gap-1 text-xs mt-1 transition-colors hover:opacity-70"
                          style={{ color: themeColors.primary }}
                        >
                          <Navigation size={12} />
                          View on Map
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={getOfficeTypeBadge(location.officeType)}>
                        {location.officeType}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {location.contactPerson?.name ? (
                        <div>
                          <div className="font-medium">{location.contactPerson.name}</div>
                          {location.contactPerson.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone size={12} />
                              {location.contactPerson.phone}
                            </div>
                          )}
                          {location.contactPerson.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail size={12} />
                              {location.contactPerson.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Not specified</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">{formatCreatedByName(location.createdBy)}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {location.createdBy?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{formatDate(location.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(location)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}
                          title="Edit Office Location"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(location._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: themeColors.danger
                          }}
                          title="Delete Office Location"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors hover:opacity-90 ${
                          pagination.currentPage === pageNum ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: pagination.currentPage === pageNum ? themeColors.primary : themeColors.background,
                          border: `1px solid ${themeColors.border}`,
                          color: pagination.currentPage === pageNum ? 'white' : themeColors.text
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateOfficeLocationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onOfficeLocationCreated={handleOfficeLocationCreated}
      />

      <UpdateOfficeLocationModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedOfficeLocation(null);
        }}
        officeLocation={selectedOfficeLocation}
        onOfficeLocationUpdated={handleOfficeLocationUpdated}
      />
    </div>
  );
};

export default OfficeLocations;