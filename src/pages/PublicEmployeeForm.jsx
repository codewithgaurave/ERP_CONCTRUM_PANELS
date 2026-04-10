import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import formLinkAPI from '../apis/formLinkAPI';

const PublicEmployeeForm = () => {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [data, setData] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    alternateMobile: '', whatsappNumber: '', gender: '', dob: '',
    street: '', city: '', state: '', country: 'India', pincode: '',
    bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '',
    answers: {},
    files: {}
  });

  useEffect(() => {
    formLinkAPI.getPublicForm(token)
      .then(res => setForm(res.data.form))
      .catch(err => setError(err.response?.data?.message || 'Form not found or expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAnswerChange = (fieldId, value) => {
    setData(prev => ({ ...prev, answers: { ...prev.answers, [fieldId]: value } }));
  };

  const handleFileChange = (fieldId, files) => {
    console.log(`File selected for field ${fieldId}:`, files[0]);
    setData(prev => ({ ...prev, files: { ...prev.files, [fieldId]: files[0] } }));
  };

  const hasSectionBreaks = form?.fields?.some(f => f.fieldType === 'section_break') || false;
  
  const sections = form ? [
    ...(form.includeBaseFields?.personalInfo || form.includeBaseFields?.address || form.includeBaseFields?.bankDetails ? ['base'] : []),
    ...form.fields.reduce((acc, f, i) => {
      if (f.fieldType === 'section_break') acc.push(i);
      return acc;
    }, [])
  ] : [];

  const getSectionFields = (sectionIndex) => {
    if (!form) return [];
    if (sectionIndex === 0 && sections[0] === 'base') {
      // If no section breaks, also include all non-section-break custom fields with base
      if (!hasSectionBreaks) {
        return { type: 'base-with-fields', fields: form.fields.filter(f => f.fieldType !== 'section_break') };
      }
      return 'base';
    }
    
    const actualIndex = sections[sectionIndex];
    const nextIndex = sections[sectionIndex + 1];
    
    if (typeof actualIndex === 'number') {
      return form.fields.slice(actualIndex + 1, typeof nextIndex === 'number' ? nextIndex : undefined);
    }
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Base fields
      Object.keys(data).forEach(key => {
        if (key !== 'answers' && key !== 'files' && data[key]) {
          formData.append(key, data[key]);
        }
      });

      // Answers (non-file)
      formData.append('answers', JSON.stringify(data.answers));

      // Files - Debug logging
      console.log('Files to upload:', data.files);
      Object.entries(data.files).forEach(([fieldId, file]) => {
        if (file) {
          console.log(`Appending file for field ${fieldId}:`, file.name, file.size);
          formData.append(fieldId, file);
        }
      });

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await formLinkAPI.submitPublicForm(token, formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Form Unavailable</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Submitted!</h2>
        <p className="text-gray-500">{form.confirmationMessage}</p>
      </div>
    </div>
  );

  const currentFields = getSectionFields(currentSection);
  const totalSections = sections.length || 1;
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="relative" style={{ backgroundColor: form.headerColor || '#4F46E5' }}>
          {form.headerImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={form.headerImage} 
                alt="Header" 
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          )}
          <div className="relative px-8 py-6">
            <h1 className="text-2xl font-bold text-white">{form.title}</h1>
            {form.description && <p className="text-white/90 mt-1 text-sm">{form.description}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        {form.showProgressBar && totalSections > 1 && (
          <div className="px-8 pt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Section {currentSection + 1} of {totalSections}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Base Fields */}
          {(currentFields === 'base' || currentFields?.type === 'base-with-fields') && (
            <>
              {form.includeBaseFields?.personalInfo && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name *</label><input name="firstName" value={data.firstName} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Last Name *</label><input name="lastName" value={data.lastName} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Email *</label><input type="email" name="email" value={data.email} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Mobile *</label><input name="mobile" value={data.mobile} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Alternate Mobile</label><input name="alternateMobile" value={data.alternateMobile} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>WhatsApp</label><input name="whatsappNumber" value={data.whatsappNumber} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Gender</label><select name="gender" value={data.gender} onChange={handleChange} className={inputClass}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                    <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={data.dob} onChange={handleChange} className={inputClass} /></div>
                  </div>
                </div>
              )}
              {form.includeBaseFields?.address && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><label className={labelClass}>Street</label><input name="street" value={data.street} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>City</label><input name="city" value={data.city} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input name="state" value={data.state} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Country</label><input name="country" value={data.country} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Pincode</label><input name="pincode" value={data.pincode} onChange={handleChange} className={inputClass} /></div>
                  </div>
                </div>
              )}
              {form.includeBaseFields?.bankDetails && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">Bank Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Bank Name</label><input name="bankName" value={data.bankName} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Account Holder Name</label><input name="accountHolderName" value={data.accountHolderName} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Account Number</label><input name="accountNumber" value={data.accountNumber} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>IFSC Code</label><input name="ifscCode" value={data.ifscCode} onChange={handleChange} className={inputClass} /></div>
                    <div className="sm:col-span-2"><label className={labelClass}>Branch Name</label><input name="branchName" value={data.branchName} onChange={handleChange} className={inputClass} /></div>
                  </div>
                </div>
              )}
              {/* Custom fields when no section breaks */}
              {currentFields?.type === 'base-with-fields' && currentFields.fields.map((field) => (
                <div key={field.id}>
                  <label className={labelClass}>{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                  {field.fieldType === 'text' && <input type="text" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'email' && <input type="email" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'number' && <input type="number" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'date' && <input type="date" value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'time' && <input type="time" value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'textarea' && <textarea placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} rows={3} className={inputClass} />}
                  {field.fieldType === 'select' && (
                    <select value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass}>
                      <option value="">Select...</option>
                      {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {field.fieldType === 'radio' && (
                    <div className="space-y-2">
                      {field.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={field.id} value={opt} checked={data.answers[field.id] === opt} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.fieldType === 'checkbox' && (
                    <div className="space-y-2">
                      {field.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" value={opt} checked={(data.answers[field.id] || []).includes(opt)} onChange={e => { const current = data.answers[field.id] || []; const updated = e.target.checked ? [...current, opt] : current.filter(v => v !== opt); handleAnswerChange(field.id, updated); }} />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.fieldType === 'file' && <input type="file" onChange={e => handleFileChange(field.id, e.target.files)} required={field.required} className={inputClass} />}
                  {field.fieldType === 'rating' && (
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} type="button" onClick={() => handleAnswerChange(field.id, star)} className={`text-2xl ${data.answers[field.id] >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  )}
                  {field.fieldType === 'linear_scale' && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{field.scaleMinLabel || field.scaleMin}</span>
                      <input type="range" min={field.scaleMin} max={field.scaleMax} value={data.answers[field.id] || field.scaleMin} onChange={e => handleAnswerChange(field.id, parseInt(e.target.value))} className="flex-1" />
                      <span className="text-sm text-gray-600">{field.scaleMaxLabel || field.scaleMax}</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Custom Fields */}
          {Array.isArray(currentFields) && currentFields.map((field) => {
            if (field.fieldType === 'section_break') {
              return (
                <div key={field.id}>
                  <h2 className="text-xl font-bold text-gray-800">{field.sectionTitle}</h2>
                  {field.sectionDescription && <p className="text-sm text-gray-500 mt-1">{field.sectionDescription}</p>}
                </div>
              );
            }

            return (
              <div key={field.id}>
                <label className={labelClass}>{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                
                {field.fieldType === 'text' && <input type="text" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                {field.fieldType === 'email' && <input type="email" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                {field.fieldType === 'number' && <input type="number" placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                {field.fieldType === 'date' && <input type="date" value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                {field.fieldType === 'time' && <input type="time" value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass} />}
                {field.fieldType === 'textarea' && <textarea placeholder={field.placeholder} value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} rows={3} className={inputClass} />}
                
                {field.fieldType === 'select' && (
                  <select value={data.answers[field.id] || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} className={inputClass}>
                    <option value="">Select...</option>
                    {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                )}

                {field.fieldType === 'radio' && (
                  <div className="space-y-2">
                    {field.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={field.id} value={opt} checked={data.answers[field.id] === opt} onChange={e => handleAnswerChange(field.id, e.target.value)} required={field.required} />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.fieldType === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={(data.answers[field.id] || []).includes(opt)}
                          onChange={e => {
                            const current = data.answers[field.id] || [];
                            const updated = e.target.checked ? [...current, opt] : current.filter(v => v !== opt);
                            handleAnswerChange(field.id, updated);
                          }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.fieldType === 'file' && (
                  <div>
                    <input type="file" accept={field.allowedFileTypes.map(t => `.${t}`).join(',')} onChange={e => handleFileChange(field.id, e.target.files)} required={field.required} className={inputClass} />
                    <p className="text-xs text-gray-500 mt-1">Max size: {field.maxFileSizeMB}MB. Allowed: {field.allowedFileTypes.join(', ')}</p>
                  </div>
                )}

                {field.fieldType === 'rating' && (
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => handleAnswerChange(field.id, n)} className="text-3xl transition">
                        {(data.answers[field.id] || 0) >= n ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                )}

                {field.fieldType === 'linear_scale' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{field.scaleMinLabel || field.scaleMin}</span>
                      <input type="range" min={field.scaleMin} max={field.scaleMax} value={data.answers[field.id] || field.scaleMin} onChange={e => handleAnswerChange(field.id, +e.target.value)} className="flex-1" />
                      <span className="text-xs text-gray-500">{field.scaleMaxLabel || field.scaleMax}</span>
                    </div>
                    <p className="text-center text-sm font-medium">{data.answers[field.id] || field.scaleMin}</p>
                  </div>
                )}
              </div>
            );
          })}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {currentSection > 0 && (
              <button type="button" onClick={() => setCurrentSection(prev => prev - 1)} className="px-4 py-2 border rounded-lg text-sm font-medium">
                ← Back
              </button>
            )}
            {currentSection < totalSections - 1 ? (
              <button type="button" onClick={() => setCurrentSection(prev => prev + 1)} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicEmployeeForm;
