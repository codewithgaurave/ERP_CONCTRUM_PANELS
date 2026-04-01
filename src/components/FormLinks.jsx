import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import formLinkAPI from '../apis/formLinkAPI';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { 
  Copy, Plus, Trash2, ToggleLeft, ToggleRight, Eye, X, ChevronDown, ChevronUp, 
  Edit, Files, Link2, Users, Calendar, Clock, ExternalLink, Share2, Settings,
  FileText, Mail, Hash, Type, MessageSquare, List, CheckSquare, Upload,
  Star, BarChart3, Minus, Activity, TrendingUp, Download
} from 'lucide-react';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

// ─── Enhanced Submissions Drawer ─────────────────────────────────────────────
const SubmissionsDrawer = ({ formLink, onClose, onConvert, themeColors }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    formLinkAPI.getById(formLink._id)
      .then(res => setSubmissions(res.data.formLink.submissions || []))
      .catch(() => toast.error('Error loading submissions'))
      .finally(() => setLoading(false));
  }, [formLink._id]);

  const updateStatus = async (submissionId, status) => {
    try {
      await formLinkAPI.updateSubmissionStatus(formLink._id, submissionId, status);
      setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, status } : s));
      toast.success(`Submission ${status.toLowerCase()}`);
    } catch {
      toast.error('Error updating status');
    }
  };

  const statusConfig = {
    Pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    Approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckSquare },
    Rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: X }
  };

  const exportToExcel = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }

    // Prepare data for Excel
    const excelData = submissions.map((sub, index) => {
      const baseData = {
        'S.No': index + 1,
        'First Name': sub.firstName || '',
        'Last Name': sub.lastName || '',
        'Email': sub.email || '',
        'Mobile': sub.mobile || '',
        'Alternate Mobile': sub.alternateMobile || '',
        'WhatsApp': sub.whatsappNumber || '',
        'Gender': sub.gender || '',
        'Date of Birth': sub.dob ? new Date(sub.dob).toLocaleDateString() : '',
        'Street': sub.street || '',
        'City': sub.city || '',
        'State': sub.state || '',
        'Country': sub.country || '',
        'Pincode': sub.pincode || '',
        'Status': sub.status || 'Pending',
        'Submitted At': new Date(sub.submittedAt).toLocaleString(),
      };

      // Add custom answers with string reconstruction
      let parsedAnswers = {};
      
      if (sub.answers && typeof sub.answers === 'object') {
        const keys = Object.keys(sub.answers);
        const isStringLike = keys.every(key => !isNaN(key) && parseInt(key) < 1000);
        
        if (isStringLike) {
          // It's a string broken into characters, reconstruct it
          const reconstructedString = keys
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => sub.answers[key])
            .join('');
          
          try {
            parsedAnswers = JSON.parse(reconstructedString);
          } catch (e) {
            console.error('Failed to parse reconstructed string for Excel:', e);
            parsedAnswers = {};
          }
        } else {
          // It's already a proper object
          parsedAnswers = sub.answers;
        }
      }

      if (parsedAnswers && typeof parsedAnswers === 'object') {
        Object.entries(parsedAnswers).forEach(([fieldId, answer]) => {
          const field = formLink.fields?.find(f => f.id === fieldId);
          const label = field?.label || field?.placeholder || `Question ${fieldId.replace('field_', '')}`;
          
          let displayValue = '';
          
          if (typeof answer === 'string') {
            // Check if it's a file path
            if (answer.startsWith('/uploads/') || answer.startsWith('http')) {
              displayValue = answer.split('/').pop() || 'Uploaded File';
            } else if (answer.trim() === '') {
              displayValue = 'No response';
            } else {
              displayValue = answer;
            }
          } else if (typeof answer === 'object' && answer !== null) {
            // Handle file objects
            if (answer.filename || answer.path || answer.url) {
              displayValue = answer.filename || answer.originalname || 'Uploaded File';
            } else if (Object.keys(answer).length === 0) {
              displayValue = 'No response';
            } else {
              displayValue = JSON.stringify(answer);
            }
          } else if (Array.isArray(answer)) {
            displayValue = answer.length > 0 ? answer.join(', ') : 'No response';
          } else {
            displayValue = answer ? String(answer) : 'No response';
          }
          
          // Only add non-empty values (but include "No response" for tracking)
          if (displayValue && displayValue !== 'undefined' && displayValue !== 'null') {
            baseData[label] = displayValue;
          }
        });
      }

      return baseData;
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate file name
    const fileName = `${formLink.title.replace(/[^a-z0-9]/gi, '_')}_Submissions_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
    toast.success('Excel file downloaded successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="h-full w-full max-w-3xl overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300" style={{ backgroundColor: themeColors.surface }}>
        {/* Header */}
        <div className="sticky top-0 z-10 border-b backdrop-blur-md bg-white/95" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: themeColors.primary + '20' }}>
                <Users size={20} style={{ color: themeColors.primary }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>Form Submissions</h2>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>{formLink.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: themeColors.primary + '10',
                  color: themeColors.primary,
                  border: `1px solid ${themeColors.primary}30`
                }}
              >
                <Download size={16} />
                Export Excel
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} style={{ color: themeColors.textSecondary }} />
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === 'Approved').length}</div>
                <div className="text-xs text-green-600">Approved</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-600">{submissions.filter(s => s.status === 'Pending').length}</div>
                <div className="text-xs text-amber-600">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* View Toggle - Removed Table View */}
          {submissions.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
              <p className="mt-4 text-sm" style={{ color: themeColors.textSecondary }}>Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>No submissions yet</h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>Share your form link to start collecting responses</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const StatusIcon = statusConfig[sub.status]?.icon || Clock;
              return (
                <div key={sub._id} className="rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: themeColors.border }}>
                  {/* Summary Row */}
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    style={{ backgroundColor: themeColors.background }}
                    onClick={() => setExpanded(expanded === sub._id ? null : sub._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {sub.firstName?.[0]}{sub.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: themeColors.text }}>{sub.firstName} {sub.lastName}</p>
                        <div className="flex items-center gap-3 text-sm" style={{ color: themeColors.textSecondary }}>
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {sub.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash size={12} />
                            {sub.mobile}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${statusConfig[sub.status]?.color}`}>
                        <StatusIcon size={12} />
                        {sub.status}
                      </span>
                      <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                      {expanded === sub._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded === sub._id && (
                    <div className="border-t" style={{ borderColor: themeColors.border }}>
                      <div className="p-5 space-y-4">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {[
                            ['Gender', sub.gender || '-'], 
                            ['DOB', sub.dob ? new Date(sub.dob).toLocaleDateString() : '-'],
                            ['Alt Mobile', sub.alternateMobile || '-'], 
                            ['WhatsApp', sub.whatsappNumber || '-'],
                            ['City', sub.city || '-'], 
                            ['State', sub.state || '-'],
                            ['Country', sub.country || '-'], 
                            ['Pincode', sub.pincode || '-'],
                          ].map(([label, val]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium" style={{ color: themeColors.textSecondary }}>{label}:</span>
                              <span style={{ color: themeColors.text }}>{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Custom Answers */}
                        {(() => {
                          let parsedAnswers = {};
                          
                          if (sub.answers && typeof sub.answers === 'object') {
                            // Check if it's a string-like object (character by character)
                            const keys = Object.keys(sub.answers);
                            const isStringLike = keys.every(key => !isNaN(key) && parseInt(key) < 1000);
                            
                            if (isStringLike) {
                              // It's a string broken into characters, reconstruct it
                              const reconstructedString = keys
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map(key => sub.answers[key])
                                .join('');
                              
                              console.log('Reconstructed string:', reconstructedString);
                              
                              try {
                                parsedAnswers = JSON.parse(reconstructedString);
                              } catch (e) {
                                console.error('Failed to parse reconstructed string:', e);
                                return null;
                              }
                            } else {
                              // It's already a proper object
                              parsedAnswers = sub.answers;
                            }
                          } else {
                            return null;
                          }
                          
                          // Check if parsedAnswers is valid and has content
                          if (!parsedAnswers || typeof parsedAnswers !== 'object' || Object.keys(parsedAnswers).length === 0) {
                            return null;
                          }
                          
                          return (
                            <div className="pt-4 border-t" style={{ borderColor: themeColors.border }}>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
                                <MessageSquare size={14} />
                                Custom Responses ({Object.keys(parsedAnswers).length})
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(parsedAnswers).map(([fieldId, answer]) => {
                                  const field = formLink.fields?.find(f => f.id === fieldId);
                                  const label = field?.label || field?.placeholder || `Question ${fieldId.replace('field_', '')}`;
                                  
                                  // Handle different answer types
                                  let isFile = false;
                                  let displayValue = '';
                                  let fileUrl = '';
                                  
                                  if (typeof answer === 'string') {
                                    // Check if it's a file path
                                    if (answer.startsWith('/uploads/') || answer.startsWith('http')) {
                                      isFile = true;
                                      fileUrl = answer;
                                      displayValue = answer.split('/').pop() || 'Uploaded File';
                                    } else if (answer.trim() === '') {
                                      displayValue = 'No response';
                                    } else {
                                      displayValue = answer;
                                    }
                                  } else if (typeof answer === 'object' && answer !== null) {
                                    // Handle file objects (if any)
                                    if (answer.filename || answer.path || answer.url || answer.originalname) {
                                      isFile = true;
                                      fileUrl = answer.url || answer.path || `/uploads/${answer.filename}`;
                                      displayValue = answer.filename || answer.originalname || 'Uploaded File';
                                    } else if (Object.keys(answer).length === 0) {
                                      // Empty object - no response provided
                                      displayValue = 'No response';
                                    } else {
                                      // Other object types
                                      displayValue = JSON.stringify(answer);
                                    }
                                  } else if (Array.isArray(answer)) {
                                    displayValue = answer.length > 0 ? answer.join(', ') : 'No response';
                                  } else {
                                    displayValue = answer ? String(answer) : 'No response';
                                  }
                                  
                                  // Skip completely empty or undefined values
                                  if (!displayValue || displayValue === 'undefined' || displayValue === 'null') {
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={fieldId} className="p-3 rounded-lg bg-gray-50">
                                      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
                                      <div className="text-sm font-medium" style={{ color: themeColors.text }}>
                                        {isFile ? (
                                          <a 
                                            href={fileUrl.startsWith('http') ? fileUrl : `${import.meta.env.VITE_BASE_API}${fileUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                          >
                                            <Upload size={14} />
                                            {displayValue}
                                            <ExternalLink size={12} />
                                          </a>
                                        ) : (
                                          <span className={displayValue === 'No response' ? 'text-gray-500 italic' : ''}>
                                            {displayValue}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }).filter(Boolean)}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: themeColors.border }}>
                          <div className="flex gap-2">
                            {sub.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => updateStatus(sub._id, 'Approved')} 
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  <CheckSquare size={14} />
                                  Approve
                                </button>
                                <button 
                                  onClick={() => updateStatus(sub._id, 'Rejected')} 
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                                >
                                  <X size={14} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {sub.status === 'Approved' && !sub.convertedToEmployee && (
                              <button
                                onClick={() => onConvert(sub)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                style={{ backgroundColor: themeColors.primary }}
                              >
                                <Plus size={14} />
                                Add to Employees
                              </button>
                            )}
                            {sub.convertedToEmployee && (
                              <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                <CheckSquare size={12} />
                                Added to System
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Enhanced Main FormLinks Component ───────────────────────────────────────
const FormLinks = ({ onConvertToEmployee }) => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const [formLinks, setFormLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);

  useEffect(() => {
    formLinkAPI.getAll()
      .then(res => setFormLinks(res.data.formLinks || []))
      .catch(() => toast.error('Error loading form links'))
      .finally(() => setLoading(false));
  }, []);

  const handleDuplicate = async (id) => {
    try {
      const res = await formLinkAPI.duplicate(id);
      setFormLinks(prev => [res.data.formLink, ...prev]);
      toast.success('Form duplicated successfully!');
    } catch {
      toast.error('Error duplicating form');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await formLinkAPI.toggle(id);
      setFormLinks(prev => prev.map(f => f._id === id ? { ...f, isActive: res.data.formLink.isActive } : f));
      toast.success(`Form ${res.data.formLink.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Error toggling form link');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this form? All submissions will be permanently lost.')) return;
    try {
      await formLinkAPI.remove(id);
      setFormLinks(prev => prev.filter(f => f._id !== id));
      toast.success('Form deleted successfully');
    } catch {
      toast.error('Error deleting form');
    }
  };

  const copyLink = (token) => {
    const url = `${FRONTEND_URL}/apply/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      <p className="mt-4 text-sm" style={{ color: themeColors.textSecondary }}>Loading your forms...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${themeColors.primary}20 0%, ${themeColors.primary}10 100%)` }}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary + '20' }}>
                  <Link2 size={24} style={{ color: themeColors.primary }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>Form Builder</h2>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Create Google Form-like applications. Share links to collect candidate data seamlessly.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/form-builder')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Plus size={18} />
              Create New Form
            </button>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <div className="w-full h-full" style={{ 
            backgroundImage: `radial-gradient(circle, ${themeColors.primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      {formLinks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{formLinks.length}</div>
                <div className="text-sm text-gray-600">Total Forms</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Activity size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formLinks.filter(f => f.isActive).length}</div>
                <div className="text-sm text-gray-600">Active Forms</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formLinks.reduce((acc, f) => acc + (f.submissions?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <TrendingUp size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(formLinks.reduce((acc, f) => acc + (f.submissions?.length || 0), 0) / Math.max(formLinks.length, 1))}
                </div>
                <div className="text-sm text-gray-600">Avg. Responses</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms List */}
      {formLinks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed" style={{ borderColor: themeColors.border }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>No forms created yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: themeColors.textSecondary }}>
            Create your first form to start collecting employee applications. Build forms with custom fields, sections, and more.
          </p>
          <button 
            onClick={() => navigate('/form-builder')} 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus size={18} />
            Create Your First Form
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {formLinks.map(link => (
            <div key={link._id} className="group p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Form Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: link.headerColor + '20' }}>
                      <FileText size={18} style={{ color: link.headerColor || themeColors.primary }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ color: themeColors.text }}>{link.title}</h3>
                      {link.description && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: themeColors.textSecondary }}>
                          {link.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status & Meta */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
                      link.isActive 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    {link.fields?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        <List size={12} />
                        {link.fields.length} fields
                      </span>
                    )}
                    
                    {link.submissions?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        <Users size={12} />
                        {link.submissions.length} responses
                      </span>
                    )}
                  </div>

                  {/* Share Link */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                    <Link2 size={16} className="text-gray-400 flex-shrink-0" />
                    <code className="text-sm font-mono text-gray-600 flex-1 truncate">
                      {FRONTEND_URL}/apply/{link.token}
                    </code>
                    <button 
                      onClick={() => copyLink(link.token)} 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border hover:bg-gray-50 transition-colors"
                      title="Copy link"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>

                  {/* Expiry Info */}
                  {link.expiresAt && (
                    <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: themeColors.textSecondary }}>
                      <Calendar size={12} />
                      Expires: {new Date(link.expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/form-builder/${link._id}`)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors group-hover:bg-blue-50"
                    title="Edit Form"
                  >
                    <Edit size={16} style={{ color: themeColors.textSecondary }} />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicate(link._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Duplicate Form"
                  >
                    <Files size={16} style={{ color: themeColors.textSecondary }} />
                  </button>
                  
                  <button
                    onClick={() => setSelectedLink(link)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm font-medium"
                    style={{ borderColor: themeColors.border, color: themeColors.text }}
                  >
                    <Eye size={14} />
                    View Responses
                  </button>
                  
                  <button 
                    onClick={() => handleToggle(link._id)} 
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={link.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {link.isActive
                      ? <ToggleRight size={20} style={{ color: themeColors.primary }} />
                      : <ToggleLeft size={20} style={{ color: themeColors.textSecondary }} />}
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(link._id)} 
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Form"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Drawer */}
      {selectedLink && (
        <SubmissionsDrawer
          formLink={selectedLink}
          onClose={() => setSelectedLink(null)}
          onConvert={onConvertToEmployee}
          themeColors={themeColors}
        />
      )}
    </div>
  );
};

export default FormLinks;