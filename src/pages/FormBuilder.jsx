import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import formLinkAPI from '../apis/formLinkAPI';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save, 
  ArrowLeft, 
  Settings, 
  Copy,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  Star,
  SlidersHorizontal,
  Minus,
  Palette,
  Lock,
  Unlock,
  Sparkles,
  FileText,
  Layers,
  Zap,
  CheckCircle2,
  X,
  MoreVertical,
  Move
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type, color: '#3B82F6', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft, color: '#8B5CF6', description: 'Multi-line text area' },
  { value: 'number', label: 'Number', icon: Hash, color: '#10B981', description: 'Numeric input field' },
  { value: 'email', label: 'Email', icon: Mail, color: '#F59E0B', description: 'Email address field' },
  { value: 'date', label: 'Date', icon: Calendar, color: '#EC4899', description: 'Date picker' },
  { value: 'time', label: 'Time', icon: Clock, color: '#06B6D4', description: 'Time picker' },
  { value: 'select', label: 'Dropdown', icon: ChevronDown, color: '#84CC16', description: 'Single selection list' },
  { value: 'radio', label: 'Multiple Choice', icon: Circle, color: '#F97316', description: 'Radio button options' },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare, color: '#14B8A6', description: 'Multiple selections' },
  { value: 'file', label: 'File Upload', icon: Upload, color: '#6366F1', description: 'Upload files' },
  { value: 'rating', label: 'Rating', icon: Star, color: '#EAB308', description: 'Star rating scale' },
  { value: 'linear_scale', label: 'Linear Scale', icon: SlidersHorizontal, color: '#A855F7', description: 'Numeric scale' },
  { value: 'section_break', label: 'Section Break', icon: Layers, color: '#64748B', description: 'Divide form sections' }
];

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(null);

  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: '',
    headerColor: '#6366F1',
    fields: [],
    responseLimit: null,
    expiresAt: '',
    confirmationMessage: 'Your response has been recorded. Thank you!',
    showProgressBar: true,
    includeBaseFields: { personalInfo: true, address: true, bankDetails: false }
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      formLinkAPI.getById(id)
        .then(res => {
          const data = res.data.formLink;
          setForm({
            title: data.title,
            description: data.description || '',
            headerColor: data.headerColor || '#6366F1',
            headerImage: data.headerImage || null,
            fields: data.fields || [],
            responseLimit: data.responseLimit,
            expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().slice(0, 16) : '',
            confirmationMessage: data.confirmationMessage,
            showProgressBar: data.showProgressBar,
            includeBaseFields: data.includeBaseFields || { personalInfo: true, address: true, bankDetails: false }
          });
          if (data.headerImage) {
            setHeaderImagePreview(data.headerImage);
          }
        })
        .catch(() => toast.error('Error loading form'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: type === 'section_break' ? 'Section Title' : 'Untitled Question',
      fieldType: type,
      placeholder: '',
      options: ['Option 1'],
      required: false,
      order: form.fields.length,
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: '',
      scaleMaxLabel: '',
      sectionTitle: 'Section Title',
      sectionDescription: '',
      allowedFileTypes: ['pdf', 'jpg', 'png'],
      maxFileSizeMB: 5
    };
    setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    setActiveFieldIndex(form.fields.length);
  };

  const updateField = (index, key, value) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [key]: value } : f)
    }));
  };

  const removeField = (index) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
    if (activeFieldIndex === index) setActiveFieldIndex(null);
    else if (activeFieldIndex > index) setActiveFieldIndex(activeFieldIndex - 1);
  };

  const duplicateField = (index) => {
    const field = { ...form.fields[index], id: `field_${Date.now()}` };
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields.slice(0, index + 1), field, ...prev.fields.slice(index + 1)]
    }));
  };

  const handleDragStart = (index) => setDraggedIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFields = [...form.fields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, removed);
    setForm(prev => ({ ...prev, fields: newFields }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setHeaderImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeHeaderImage = () => {
    setHeaderImage(null);
    setHeaderImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Form title is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt || undefined,
        responseLimit: form.responseLimit || null,
        headerImage: headerImagePreview || null
      };
      if (id) {
        await formLinkAPI.update(id, payload);
        toast.success('Form updated successfully!');
      } else {
        const res = await formLinkAPI.create(payload);
        toast.success('Form created successfully!');
        navigate(`/form-builder/${res.data.formLink._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto" style={{ borderColor: `${themeColors.primary} transparent ${themeColors.primary} ${themeColors.primary}` }}></div>
        <p className="mt-4 text-sm" style={{ color: themeColors.textSecondary }}>Loading form builder...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/employees')} 
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              style={{ color: themeColors.textSecondary }}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                <FileText size={20} style={{ color: themeColors.primary }} />
              </div>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-bold border-0 outline-none bg-transparent w-64"
                style={{ color: themeColors.text }}
                placeholder="Form Title"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ borderColor: themeColors.border, color: themeColors.text }}
            >
              <Upload size={16} />
              Header Image
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ borderColor: themeColors.border, color: themeColors.text }}
            >
              <Settings size={16} />
              Settings
            </button>
            <button 
              onClick={() => setShowPreview(true)} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ borderColor: themeColors.border, color: themeColors.text }}
            >
              <Eye size={16} />
              Preview
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Field Types Palette */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                  <Sparkles size={16} style={{ color: themeColors.primary }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: themeColors.text }}>Add Fields</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>Click to add to form</p>
            </div>
            <div className="p-3 space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto">
              {FIELD_TYPES.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => addField(type.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:shadow-md group"
                    style={{ 
                      color: themeColors.text,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = `${type.color}10`;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${type.color}15` }}
                    >
                      <IconComponent size={18} style={{ color: type.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">{type.label}</span>
                      <span className="text-xs block" style={{ color: themeColors.textSecondary }}>{type.description}</span>
                    </div>
                    <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: type.color }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Form Editor */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Preview */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div 
              className="p-8 relative overflow-hidden"
              style={{ 
                background: headerImagePreview 
                  ? `url(${headerImagePreview}) center/cover`
                  : `linear-gradient(135deg, ${form.headerColor} 0%, ${form.headerColor}DD 100%)`
              }}
            >
              {headerImagePreview && (
                <div className="absolute inset-0 bg-black/30"></div>
              )}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }}></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(-30%, 30%)' }}></div>
              <div className="relative z-10">
                {headerImagePreview && (
                  <button
                    onClick={removeHeaderImage}
                    className="absolute top-0 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                )}
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-3xl font-bold bg-transparent border-0 outline-none text-white w-full placeholder-white/70"
                  placeholder="Form Title"
                />
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-3 text-base bg-transparent border-0 outline-none text-white/90 w-full placeholder-white/60 resize-none"
                  placeholder="Add a description to your form..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Base Fields Toggle */}
          <div className="p-5 rounded-2xl border shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                <Layers size={20} style={{ color: themeColors.primary }} />
              </div>
              <div>
                <h4 className="text-sm font-bold" style={{ color: themeColors.text }}>Default Fields</h4>
                <p className="text-xs" style={{ color: themeColors.textSecondary }}>Include standard employee fields</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label 
                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: form.includeBaseFields.personalInfo ? themeColors.primary : themeColors.border,
                  backgroundColor: form.includeBaseFields.personalInfo ? `${themeColors.primary}10` : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.includeBaseFields.personalInfo}
                  onChange={e => setForm(prev => ({ ...prev, includeBaseFields: { ...prev.includeBaseFields, personalInfo: e.target.checked } }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: themeColors.primary }}
                />
                <div>
                  <span className="text-sm font-medium block" style={{ color: themeColors.text }}>Personal Info</span>
                  <span className="text-xs" style={{ color: themeColors.textSecondary }}>Name, Email, Mobile, Gender, DOB</span>
                </div>
              </label>
              <label 
                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: form.includeBaseFields.address ? themeColors.primary : themeColors.border,
                  backgroundColor: form.includeBaseFields.address ? `${themeColors.primary}10` : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.includeBaseFields.address}
                  onChange={e => setForm(prev => ({ ...prev, includeBaseFields: { ...prev.includeBaseFields, address: e.target.checked } }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: themeColors.primary }}
                />
                <div>
                  <span className="text-sm font-medium block" style={{ color: themeColors.text }}>Address</span>
                  <span className="text-xs" style={{ color: themeColors.textSecondary }}>Street, City, State, Country, Pincode</span>
                </div>
              </label>
              <label 
                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: form.includeBaseFields.bankDetails ? themeColors.primary : themeColors.border,
                  backgroundColor: form.includeBaseFields.bankDetails ? `${themeColors.primary}10` : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.includeBaseFields.bankDetails}
                  onChange={e => setForm(prev => ({ ...prev, includeBaseFields: { ...prev.includeBaseFields, bankDetails: e.target.checked } }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: themeColors.primary }}
                />
                <div>
                  <span className="text-sm font-medium block" style={{ color: themeColors.text }}>Bank Details</span>
                  <span className="text-xs" style={{ color: themeColors.textSecondary }}>Bank Name, Account Number, IFSC, Branch</span>
                </div>
              </label>
            </div>
          </div>

          {/* Fields */}
          {form.fields.map((field, index) => {
            const fieldType = FIELD_TYPES.find(t => t.value === field.fieldType);
            const IconComponent = fieldType?.icon || Type;
            const isActive = activeFieldIndex === index;
            
            return (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveFieldIndex(index)}
                className={`p-5 rounded-2xl border-2 cursor-move transition-all duration-300 ${
                  isActive ? 'shadow-lg scale-[1.01]' : 'shadow-sm hover:shadow-md'
                } ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                style={{ 
                  backgroundColor: themeColors.surface, 
                  borderColor: isActive ? themeColors.primary : themeColors.border,
                  transform: draggedIndex === index ? 'rotate(2deg)' : 'none'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <GripVertical size={18} className="text-gray-300 cursor-grab active:cursor-grabbing" />
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${fieldType?.color || '#6366F1'}15` }}
                    >
                      <IconComponent size={20} style={{ color: fieldType?.color || '#6366F1' }} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {field.fieldType === 'section_break' ? (
                      <>
                        <input
                          value={field.sectionTitle}
                          onChange={e => updateField(index, 'sectionTitle', e.target.value)}
                          className="text-xl font-bold w-full border-0 outline-none bg-transparent"
                          placeholder="Section Title"
                          style={{ color: themeColors.text }}
                        />
                        <textarea
                          value={field.sectionDescription}
                          onChange={e => updateField(index, 'sectionDescription', e.target.value)}
                          className="text-sm w-full border-0 outline-none bg-transparent resize-none"
                          placeholder="Add a description for this section..."
                          rows={2}
                          style={{ color: themeColors.textSecondary }}
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <input
                            value={field.label}
                            onChange={e => updateField(index, 'label', e.target.value)}
                            className="text-lg font-semibold flex-1 border-0 outline-none bg-transparent"
                            placeholder="Question"
                            style={{ color: themeColors.text }}
                          />
                          <span 
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ 
                              backgroundColor: `${fieldType?.color || '#6366F1'}15`, 
                              color: fieldType?.color || '#6366F1' 
                            }}
                          >
                            <IconComponent size={12} />
                            {fieldType?.label || 'Text'}
                          </span>
                          {field.required ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                              <Lock size={12} />
                              Required
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                              <Unlock size={12} />
                              Optional
                            </span>
                          )}
                        </div>
                        
                        {['text', 'email', 'number'].includes(field.fieldType) && (
                          <div className="relative">
                            <input
                              value={field.placeholder}
                              onChange={e => updateField(index, 'placeholder', e.target.value)}
                              className="text-sm w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                              placeholder="Enter placeholder text..."
                              style={{ 
                                borderColor: themeColors.border,
                                color: themeColors.text,
                                backgroundColor: themeColors.background
                              }}
                              onFocus={e => e.target.style.borderColor = themeColors.primary}
                              onBlur={e => e.target.style.borderColor = themeColors.border}
                            />
                          </div>
                        )}

                        {field.fieldType === 'textarea' && (
                          <textarea
                            value={field.placeholder}
                            onChange={e => updateField(index, 'placeholder', e.target.value)}
                            className="text-sm w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200"
                            placeholder="Enter placeholder text..."
                            rows={3}
                            style={{ 
                              borderColor: themeColors.border,
                              color: themeColors.text,
                              backgroundColor: themeColors.background
                            }}
                            onFocus={e => e.target.style.borderColor = themeColors.primary}
                            onBlur={e => e.target.style.borderColor = themeColors.border}
                          />
                        )}

                        {['select', 'radio', 'checkbox'].includes(field.fieldType) && (
                          <div className="space-y-3">
                            {field.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-3 group">
                                <div 
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${fieldType?.color || '#6366F1'}15` }}
                                >
                                  {field.fieldType === 'checkbox' ? (
                                    <CheckSquare size={14} style={{ color: fieldType?.color || '#6366F1' }} />
                                  ) : (
                                    <Circle size={14} style={{ color: fieldType?.color || '#6366F1' }} />
                                  )}
                                </div>
                                <input
                                  value={opt}
                                  onChange={e => {
                                    const newOpts = [...field.options];
                                    newOpts[i] = e.target.value;
                                    updateField(index, 'options', newOpts);
                                  }}
                                  className="flex-1 text-sm px-4 py-2.5 border-2 rounded-xl transition-all duration-200"
                                  style={{ 
                                    borderColor: themeColors.border,
                                    color: themeColors.text,
                                    backgroundColor: themeColors.background
                                  }}
                                  onFocus={e => e.target.style.borderColor = themeColors.primary}
                                  onBlur={e => e.target.style.borderColor = themeColors.border}
                                />
                                <button 
                                  onClick={() => updateField(index, 'options', field.options.filter((_, idx) => idx !== i))} 
                                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
                                >
                                  <Trash2 size={16} className="text-red-500" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => updateField(index, 'options', [...field.options, `Option ${field.options.length + 1}`])}
                              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md"
                              style={{ 
                                color: themeColors.primary,
                                backgroundColor: `${themeColors.primary}10`
                              }}
                            >
                              <Plus size={16} />
                              Add option
                            </button>
                          </div>
                        )}

                        {field.fieldType === 'linear_scale' && (
                          <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.background }}>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Min Value</label>
                                <input 
                                  type="number" 
                                  value={field.scaleMin} 
                                  onChange={e => updateField(index, 'scaleMin', +e.target.value)} 
                                  className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                                  style={{ borderColor: themeColors.border }}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Max Value</label>
                                <input 
                                  type="number" 
                                  value={field.scaleMax} 
                                  onChange={e => updateField(index, 'scaleMax', +e.target.value)} 
                                  className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                                  style={{ borderColor: themeColors.border }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Min Label</label>
                                <input 
                                  value={field.scaleMinLabel} 
                                  onChange={e => updateField(index, 'scaleMinLabel', e.target.value)} 
                                  placeholder="e.g., Poor"
                                  className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                                  style={{ borderColor: themeColors.border }}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Max Label</label>
                                <input 
                                  value={field.scaleMaxLabel} 
                                  onChange={e => updateField(index, 'scaleMaxLabel', e.target.value)} 
                                  placeholder="e.g., Excellent"
                                  className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                                  style={{ borderColor: themeColors.border }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {field.fieldType === 'file' && (
                          <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: themeColors.background }}>
                            <div>
                              <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Allowed File Types</label>
                              <input
                                value={field.allowedFileTypes.join(', ')}
                                onChange={e => updateField(index, 'allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="pdf, jpg, png, doc"
                                className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                                style={{ borderColor: themeColors.border }}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block" style={{ color: themeColors.textSecondary }}>Max File Size (MB)</label>
                              <input
                                type="number"
                                value={field.maxFileSizeMB}
                                onChange={e => updateField(index, 'maxFileSizeMB', +e.target.value)}
                                placeholder="5"
                                className="w-32 px-3 py-2 border-2 rounded-lg text-sm"
                                style={{ borderColor: themeColors.border }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                          <label 
                            className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
                            style={{ 
                              backgroundColor: field.required ? '#FEE2E2' : '#F3F4F6',
                              color: field.required ? '#DC2626' : '#6B7280'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={field.required} 
                              onChange={e => updateField(index, 'required', e.target.checked)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: '#DC2626' }}
                            />
                            <span className="text-sm font-medium">Required field</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); duplicateField(index); }} 
                      className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                      title="Duplicate field"
                    >
                      <Copy size={18} style={{ color: themeColors.textSecondary }} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeField(index); }} 
                      className="p-2.5 rounded-xl hover:bg-red-50 transition-all duration-200 hover:scale-110"
                      title="Delete field"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {form.fields.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: themeColors.border }}>
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}10` }}>
                <Zap size={32} style={{ color: themeColors.primary }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: themeColors.text }}>No fields yet</h3>
              <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                Start building your form by adding fields from the left panel
              </p>
              <button
                onClick={() => addField('text')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Plus size={18} />
                Add First Field
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: themeColors.border }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                  <Settings size={20} style={{ color: themeColors.primary }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>Form Settings</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} style={{ color: themeColors.textSecondary }} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: themeColors.text }}>
                  <Palette size={16} />
                  Header Color
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={form.headerColor} 
                    onChange={e => setForm(prev => ({ ...prev, headerColor: e.target.value }))} 
                    className="w-16 h-12 rounded-xl cursor-pointer border-2"
                    style={{ borderColor: themeColors.border }}
                  />
                  <input
                    type="text"
                    value={form.headerColor}
                    onChange={e => setForm(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="flex-1 px-4 py-3 border-2 rounded-xl text-sm font-mono"
                    style={{ borderColor: themeColors.border }}
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: themeColors.text }}>
                  <Hash size={16} />
                  Response Limit
                </label>
                <input 
                  type="number" 
                  value={form.responseLimit || ''} 
                  onChange={e => setForm(prev => ({ ...prev, responseLimit: e.target.value ? +e.target.value : null }))} 
                  className="w-full px-4 py-3 border-2 rounded-xl text-sm"
                  placeholder="Leave empty for unlimited responses"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: themeColors.text }}>
                  <Calendar size={16} />
                  Expiration Date
                </label>
                <input 
                  type="datetime-local" 
                  value={form.expiresAt} 
                  onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))} 
                  className="w-full px-4 py-3 border-2 rounded-xl text-sm"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: themeColors.text }}>
                  <CheckCircle2 size={16} />
                  Confirmation Message
                </label>
                <textarea 
                  value={form.confirmationMessage} 
                  onChange={e => setForm(prev => ({ ...prev, confirmationMessage: e.target.value }))} 
                  rows={3} 
                  className="w-full px-4 py-3 border-2 rounded-xl text-sm resize-none"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              <label 
                className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200"
                style={{ 
                  borderColor: form.showProgressBar ? themeColors.primary : themeColors.border,
                  backgroundColor: form.showProgressBar ? `${themeColors.primary}10` : 'transparent'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={form.showProgressBar} 
                  onChange={e => setForm(prev => ({ ...prev, showProgressBar: e.target.checked }))}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: themeColors.primary }}
                />
                <div>
                  <span className="text-sm font-semibold block" style={{ color: themeColors.text }}>Show Progress Bar</span>
                  <span className="text-xs" style={{ color: themeColors.textSecondary }}>Display form completion progress to respondents</span>
                </div>
              </label>
            </div>
            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border }}>
              <button 
                onClick={() => setShowSettings(false)} 
                className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-gray-50"
                style={{ borderColor: themeColors.border, color: themeColors.text }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowSettings(false)} 
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: themeColors.primary }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-2xl my-8 shadow-2xl" style={{ backgroundColor: themeColors.surface }}>
            <div 
              className="p-8 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${form.headerColor} 0%, ${form.headerColor}DD 100%)`
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }}></div>
              <h1 className="text-3xl font-bold text-white relative z-10">{form.title}</h1>
              {form.description && <p className="text-white/90 mt-3 text-lg relative z-10">{form.description}</p>}
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {form.includeBaseFields.personalInfo && (
                <div className="p-5 border-2 rounded-xl" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                      <Type size={16} style={{ color: themeColors.primary }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: themeColors.text }}>Personal Information</p>
                  </div>
                  <p className="text-xs" style={{ color: themeColors.textSecondary }}>Name, Email, Mobile, Gender, DOB, etc.</p>
                </div>
              )}
              {form.includeBaseFields.address && (
                <div className="p-5 border-2 rounded-xl" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                      <AlignLeft size={16} style={{ color: themeColors.primary }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: themeColors.text }}>Address</p>
                  </div>
                  <p className="text-xs" style={{ color: themeColors.textSecondary }}>Street, City, State, Country, Pincode</p>
                </div>
              )}
              {form.includeBaseFields.bankDetails && (
                <div className="p-5 border-2 rounded-xl" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                      <Hash size={16} style={{ color: themeColors.primary }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: themeColors.text }}>Bank Details</p>
                  </div>
                  <p className="text-xs" style={{ color: themeColors.textSecondary }}>Bank Name, Account Number, IFSC, Branch</p>
                </div>
              )}
              {form.fields.map((field, i) => {
                const fieldType = FIELD_TYPES.find(t => t.value === field.fieldType);
                const IconComponent = fieldType?.icon || Type;
                
                return (
                  <div key={i} className="p-5 border-2 rounded-xl" style={{ borderColor: themeColors.border }}>
                    {field.fieldType === 'section_break' ? (
                      <>
                        <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>{field.sectionTitle}</h3>
                        {field.sectionDescription && <p className="text-sm mt-2" style={{ color: themeColors.textSecondary }}>{field.sectionDescription}</p>}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${fieldType?.color || '#6366F1'}15` }}
                          >
                            <IconComponent size={16} style={{ color: fieldType?.color || '#6366F1' }} />
                          </div>
                          <label className="text-sm font-semibold" style={{ color: themeColors.text }}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                        </div>
                        {['text', 'email', 'number'].includes(field.fieldType) && (
                          <input type={field.fieldType} placeholder={field.placeholder} className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }} />
                        )}
                        {field.fieldType === 'textarea' && <textarea placeholder={field.placeholder} rows={3} className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }} />}
                        {field.fieldType === 'date' && <input type="date" className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }} />}
                        {field.fieldType === 'time' && <input type="time" className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }} />}
                        {field.fieldType === 'select' && (
                          <select className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }}>
                            <option>Select...</option>
                            {field.options.map((o, j) => <option key={j}>{o}</option>)}
                          </select>
                        )}
                        {field.fieldType === 'radio' && field.options.map((o, j) => (
                          <div key={j} className="flex items-center gap-3 mb-2">
                            <input type="radio" disabled className="w-4 h-4" />
                            <span className="text-sm" style={{ color: themeColors.text }}>{o}</span>
                          </div>
                        ))}
                        {field.fieldType === 'checkbox' && field.options.map((o, j) => (
                          <div key={j} className="flex items-center gap-3 mb-2">
                            <input type="checkbox" disabled className="w-4 h-4" />
                            <span className="text-sm" style={{ color: themeColors.text }}>{o}</span>
                          </div>
                        ))}
                        {field.fieldType === 'file' && <input type="file" className="w-full px-4 py-3 border-2 rounded-xl" disabled style={{ borderColor: themeColors.border }} />}
                        {field.fieldType === 'rating' && (
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map(n => <Star key={n} size={28} className="text-gray-300" />)}
                          </div>
                        )}
                        {field.fieldType === 'linear_scale' && (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>{field.scaleMinLabel || field.scaleMin}</span>
                            <input type="range" min={field.scaleMin} max={field.scaleMax} className="flex-1 h-2 rounded-full" disabled />
                            <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>{field.scaleMaxLabel || field.scaleMax}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border }}>
              <button 
                onClick={() => setShowPreview(false)} 
                className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-gray-50"
                style={{ borderColor: themeColors.border, color: themeColors.text }}
              >
                Close
              </button>
              <button 
                onClick={() => setShowPreview(false)} 
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: themeColors.primary }}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
