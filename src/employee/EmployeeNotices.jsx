import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { Bell, Calendar, User, Filter } from 'lucide-react';
import apiRoutes from '../contants/api';

const EmployeeNotices = () => {
  const { themeColors } = useTheme();
  const [notices, setNotices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notices', 'announcements'
  const [filter, setFilter] = useState({ type: '', priority: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('hrms-token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch notices (from team leader and HR)
      const noticesResponse = await fetch(`${apiRoutes.notices}`, {
        headers: getAuthHeader()
      });
      
      // Fetch announcements (from HR only)
      const announcementsResponse = await fetch(`${apiRoutes.announcements}/employee-filtered`, {
        headers: getAuthHeader()
      });
      
      if (noticesResponse.ok) {
        const noticesData = await noticesResponse.json();
        setNotices(noticesData.notices || []);
      } else {
        console.error('Failed to fetch notices:', noticesResponse.status);
        toast.error('Failed to fetch notices');
      }
      
      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData.announcements || []);
      } else {
        console.error('Failed to fetch announcements:', announcementsResponse.status);
        toast.error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Urgent: 'bg-red-100 text-red-800',
      Holiday: 'bg-green-100 text-green-800',
      Meeting: 'bg-blue-100 text-blue-800',
      Training: 'bg-purple-100 text-purple-800',
      Policy: 'bg-orange-100 text-orange-800',
      General: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Combine and filter data
  const getAllItems = () => {
    const noticesWithType = notices.map(notice => ({ ...notice, itemType: 'notice' }));
    const announcementsWithType = announcements.map(announcement => ({ ...announcement, itemType: 'announcement' }));
    
    let allItems = [...noticesWithType, ...announcementsWithType];
    
    // Apply filters
    if (activeTab === 'notices') {
      allItems = noticesWithType;
    } else if (activeTab === 'announcements') {
      allItems = announcementsWithType;
    }
    
    if (filter.type) {
      allItems = allItems.filter(item => 
        (item.type && item.type.toLowerCase().includes(filter.type.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(filter.type.toLowerCase()))
      );
    }
    
    if (filter.priority) {
      allItems = allItems.filter(item => item.priority === filter.priority);
    }
    
    // Sort by creation date (newest first)
    return allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredItems = getAllItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: themeColors.text }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ color: themeColors.text }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} style={{ color: themeColors.primary }} />
            Notices & Announcements
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Stay updated with company notices and announcements
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="mt-4 md:mt-0 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: themeColors.primary }}
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{notices.length + announcements.length}</div>
          <div className="text-sm">Total Items</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{notices.length}</div>
          <div className="text-sm">Notices</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{announcements.length}</div>
          <div className="text-sm">Announcements</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Items', count: notices.length + announcements.length },
              { key: 'notices', label: 'Notices', count: notices.length },
              { key: 'announcements', label: 'Announcements', count: announcements.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.key ? themeColors.primary : themeColors.background,
                  color: activeTab === tab.key ? 'white' : themeColors.text,
                  border: `1px solid ${themeColors.border}`
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Type/Category</label>
              <input
                type="text"
                placeholder="Search by type or category..."
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 rounded-lg border"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Priority</label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-2 rounded-lg border"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-6xl mb-4" style={{ color: themeColors.textSecondary }}>📢</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.textSecondary }}>No Items Available</h3>
          <p style={{ color: themeColors.textSecondary }}>There are no notices or announcements matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div 
              key={`${item.itemType}-${item._id}`} 
              className="rounded-lg shadow-sm border hover:shadow-lg transition-shadow cursor-pointer"
              style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.itemType === 'notice' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.itemType === 'notice' ? 'Notice' : 'Announcement'}
                      </span>
                      {item.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      )}
                      {(item.category || item.type) && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category || item.type)}`}>
                          {item.category || item.type}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="line-clamp-2" style={{ color: themeColors.textSecondary }}>
                      {item.content || item.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm" style={{ color: themeColors.textSecondary }}>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.createdBy && (
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {item.createdBy.name?.first} {item.createdBy.name?.last} ({item.createdBy.role?.replace('_', ' ')})
                      </span>
                    )}
                  </div>
                  <span className="font-medium" style={{ color: themeColors.primary }}>
                    Read More →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedItem.itemType === 'notice' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedItem.itemType === 'notice' ? 'Notice' : 'Announcement'}
                    </span>
                    {selectedItem.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority}
                      </span>
                    )}
                    {(selectedItem.category || selectedItem.type) && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedItem.category || selectedItem.type)}`}>
                        {selectedItem.category || selectedItem.type}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-2xl font-bold hover:opacity-70"
                  style={{ color: themeColors.textSecondary }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 text-sm" style={{ color: themeColors.textSecondary }}>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(selectedItem.createdAt)}
                </span>
                {selectedItem.createdBy && (
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {selectedItem.createdBy.name?.first} {selectedItem.createdBy.name?.last} ({selectedItem.createdBy.role?.replace('_', ' ')})
                  </span>
                )}
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap" style={{ color: themeColors.text }}>
                  {selectedItem.content || selectedItem.message}
                </p>
              </div>
              
              {selectedItem.expiryDate && (
                <div className="border-t pt-4 text-sm" style={{ borderColor: themeColors.border, color: themeColors.textSecondary }}>
                  <span>Expires on: {formatDate(selectedItem.expiryDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeNotices;