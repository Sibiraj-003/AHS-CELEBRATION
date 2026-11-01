import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  useProfiles,
  addStoredProfile,
  updateStoredProfile,
  deleteStoredProfile,
  clearAllStoredProfiles,
  EVENT_DETAILS
} from '../data/profiles';
import type { Profile } from '../data/profiles';
import EventBadge from '../components/EventBadge';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Camera,
  Check,
  X,
  User,
  Sparkles,
  GraduationCap,
  Users,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import './Admin.css';

// Compresses uploaded image to avoid exceeding localStorage quota
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const Admin: React.FC = () => {
  const [profiles] = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState<'all' | 'freshers' | 'farewell'>('all');
  
  // Authentication Gate State (Password: admin@radio)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('ahs_admin_authorized') === 'true';
  });
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword.trim() === 'admin@radio') {
      sessionStorage.setItem('ahs_admin_authorized', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ahs_admin_authorized');
    setIsAuthenticated(false);
    setInputPassword('');
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formEvent, setFormEvent] = useState<'freshers' | 'farewell'>('freshers');
  const [formPhoto, setFormPhoto] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [targetQuickProfileId, setTargetQuickProfileId] = useState<string | null>(null);

  // Auto-generate ID from name
  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingProfile) {
      const generated = name.trim().toUpperCase().replace(/[\s\W]+/g, '_');
      setFormId(generated);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const openAddModal = () => {
    setEditingProfile(null);
    setFormName('');
    setFormId('');
    setFormEvent('freshers');
    setFormPhoto('');
    setFormRole('AHS Batch 2026');
    setFormQuote('');
    setIsModalOpen(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setFormName(profile.name);
    setFormId(profile.id);
    setFormEvent(profile.event);
    setFormPhoto(profile.photo || '');
    setFormRole(profile.role || '');
    setFormQuote(profile.quote || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setFormPhoto(base64);
      showNotification('Photo uploaded successfully!');
    } catch (err) {
      showNotification('Failed to process image', 'error');
    }
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetQuickProfileId) return;
    try {
      const base64 = await compressImage(file);
      updateStoredProfile(targetQuickProfileId, { photo: base64 });
      showNotification('Photo updated successfully!');
    } catch {
      showNotification('Failed to upload image', 'error');
    } finally {
      setTargetQuickProfileId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const triggerQuickUpload = (id: string) => {
    setTargetQuickProfileId(id);
    quickFileInputRef.current?.click();
  };

  const handleRemovePhoto = (id: string) => {
    updateStoredProfile(id, { photo: '' });
    showNotification('Photo removed');
  };

  const handleRemoveAllPhotos = () => {
    if (window.confirm('Are you sure you want to remove all existing photos?')) {
      profiles.forEach(p => {
        updateStoredProfile(p.id, { photo: '' });
      });
      showNotification('All profile photos have been removed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    const cleanId = formId.trim().toUpperCase().replace(/[\s\W]+/g, '_');

    if (!cleanName || !cleanId) {
      showNotification('Name and Register ID are required', 'error');
      return;
    }

    const newProfile: Profile = {
      id: cleanId,
      name: cleanName,
      event: formEvent,
      photo: formPhoto,
      role: formRole.trim() || (formEvent === 'freshers' ? 'AHS Batch 2026' : 'AHS Graduating Senior'),
      quote: formQuote.trim()
    };

    if (editingProfile) {
      updateStoredProfile(editingProfile.id, newProfile);
      showNotification(`Updated profile for ${cleanName}`);
    } else {
      addStoredProfile(newProfile);
      showNotification(`Added ${cleanName} to ${formEvent.toUpperCase()}`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (profile: Profile) => {
    if (window.confirm(`Are you sure you want to delete ${profile.name} (${profile.id})?`)) {
      deleteStoredProfile(profile.id);
      showNotification(`Deleted ${profile.name}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove ALL attendee data? This will clear the entire roster completely.')) {
      clearAllStoredProfiles();
      showNotification('Cleared all attendee data. Roster is now completely empty.');
    }
  };

  // Filtered List
  const filtered = profiles.filter(p => {
    const matchesFilter =
      filterEvent === 'all' || p.event === filterEvent;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const freshersCount = profiles.filter(p => p.event === 'freshers').length;
  const farewellCount = profiles.filter(p => p.event === 'farewell').length;
  const photosCount = profiles.filter(p => !!p.photo).length;

  // Render Login Gate if Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-icon-ring">
            <Lock size={36} className="text-cyan-400" />
          </div>

          <span className="admin-login-badge">RESTRICTED ACCESS</span>
          <h1 className="admin-login-title">AHS Administration Portal</h1>
          <p className="admin-login-sub">
            Please enter the administrator password to manage roster attendees, edit details, and upload photos.
          </p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <div className="admin-login-input-wrap">
              <KeyRound size={18} className="login-key-icon text-cyan-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                placeholder="Enter admin password"
                value={inputPassword}
                onChange={e => {
                  setInputPassword(e.target.value);
                  if (authError) setAuthError(false);
                }}
                autoFocus
                autoComplete="current-password"
                spellCheck="false"
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {authError && (
              <div className="admin-login-error" role="alert">
                <AlertCircle size={16} />
                <span>Incorrect password. Access denied.</span>
              </div>
            )}

            <button type="submit" className="admin-login-submit-btn">
              <span>Unlock Admin Portal</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="admin-login-footer">
            <Link to="/" className="admin-login-back-link">
              <ArrowLeft size={15} />
              <span>Return to Event Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Hidden quick upload input */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Bar */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <Link to="/" className="admin-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Portal</span>
          </Link>
          <div className="admin-brand">
            <ShieldCheck size={20} className="text-cyan-400" />
            <div>
              <h1 className="admin-brand-title">AHS Administration Portal</h1>
              <p className="admin-brand-sub">{EVENT_DETAILS.eventName} • Profile &amp; Image Manager</p>
            </div>
          </div>
        </div>

        <div className="admin-nav-actions">
          {photosCount > 0 && (
            <button
              type="button"
              className="btn-admin-action btn-danger-outline"
              onClick={handleRemoveAllPhotos}
              title="Remove photos from all profiles"
            >
              <Trash2 size={16} />
              <span>Clear All Photos</span>
            </button>
          )}
          {profiles.length > 0 && (
            <button
              type="button"
              className="btn-admin-action btn-danger-outline"
              onClick={handleClearAll}
              title="Remove all attendees from roster"
            >
              <Trash2 size={16} />
              <span>Clear All Data</span>
            </button>
          )}
          <button
            type="button"
            className="btn-admin-action btn-primary"
            onClick={openAddModal}
          >
            <Plus size={18} />
            <span>Add New Attendee</span>
          </button>
          <button
            type="button"
            className="btn-admin-action btn-secondary"
            onClick={handleLogout}
            title="Lock portal and sign out"
          >
            <LogOut size={16} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`admin-notification admin-notification--${feedbackMsg.type}`}>
          {feedbackMsg.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <Users size={24} className="stat-icon text-cyan-400" />
          <div className="stat-info">
            <span className="stat-label">Total Attendees</span>
            <span className="stat-val">{profiles.length}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <Sparkles size={24} className="stat-icon text-blue-400" />
          <div className="stat-info">
            <span className="stat-label">Freshers Profiles</span>
            <span className="stat-val">{freshersCount}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <GraduationCap size={24} className="stat-icon text-purple-400" />
          <div className="stat-info">
            <span className="stat-label">Farewell Seniors</span>
            <span className="stat-val">{farewellCount}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <Camera size={24} className="stat-icon text-emerald-400" />
          <div className="stat-info">
            <span className="stat-label">Photos Uploaded</span>
            <span className="stat-val">{photosCount} / {profiles.length}</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="admin-controls">
        <div className="admin-search-wrap">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by attendee name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="admin-clear-search"
              onClick={() => setSearchTerm('')}
            >
              &times;
            </button>
          )}
        </div>

        <div className="admin-filter-tabs">
          <button
            type="button"
            className={`admin-filter-btn ${filterEvent === 'all' ? 'active' : ''}`}
            onClick={() => setFilterEvent('all')}
          >
            All ({profiles.length})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterEvent === 'freshers' ? 'active' : ''}`}
            onClick={() => setFilterEvent('freshers')}
          >
            Freshers ({freshersCount})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterEvent === 'farewell' ? 'active' : ''}`}
            onClick={() => setFilterEvent('farewell')}
          >
            Farewell ({farewellCount})
          </button>
        </div>
      </section>

      {/* Profiles Roster Table / Card Grid */}
      <main className="admin-roster">
        <div className="admin-table-container">
          {filtered.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>ID / Pass Code</th>
                  <th>Event</th>
                  <th>Role / Batch</th>
                  <th>Photo Actions</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
              {filtered.map(profile => {
                const isFreshers = profile.event === 'freshers';
                const hasPhoto = !!profile.photo;

                return (
                  <tr key={profile.id} className={`admin-row ${isFreshers ? 'admin-row--freshers' : 'admin-row--farewell'}`}>
                    {/* Avatar */}
                    <td className="cell-avatar">
                      <div className={`admin-avatar-frame ${hasPhoto ? 'has-img' : 'no-img'}`}>
                        {hasPhoto ? (
                          <img
                            src={profile.photo}
                            alt={profile.name}
                            className="admin-avatar-img"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="admin-avatar-initials">{profile.name[0]}</span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="cell-name">
                      <span className="admin-person-name">{profile.name}</span>
                    </td>

                    {/* ID */}
                    <td className="cell-id">
                      <span className="admin-person-id">{profile.id}</span>
                    </td>

                    {/* Event Badge */}
                    <td className="cell-badge">
                      <EventBadge event={profile.event} size="sm" />
                    </td>

                    {/* Role */}
                    <td className="cell-role">
                      <span className="admin-role-text">{profile.role || '—'}</span>
                    </td>

                    {/* Photo Action Buttons */}
                    <td className="cell-photo-actions">
                      <div className="photo-btn-group">
                        <button
                          type="button"
                          className="btn-photo-action btn-upload"
                          onClick={() => triggerQuickUpload(profile.id)}
                          title="Upload new image from your device"
                        >
                          <Upload size={14} />
                          <span>{hasPhoto ? 'Replace' : 'Upload'}</span>
                        </button>
                        {hasPhoto && (
                          <button
                            type="button"
                            className="btn-photo-action btn-remove-photo"
                            onClick={() => handleRemovePhoto(profile.id)}
                            title="Remove photo"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Manage Actions */}
                    <td className="cell-actions">
                      <div className="manage-btn-group">
                        <Link
                          to={`/profile/${profile.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon-action btn-view"
                          title="View live personalized invitation card & QR"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="btn-icon-action btn-edit"
                          onClick={() => openEditModal(profile)}
                          title="Edit details"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-action btn-delete"
                          onClick={() => handleDelete(profile)}
                          title="Delete attendee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          ) : (
            <div className="admin-empty-state">
              {profiles.length === 0 ? (
                <>
                  <div className="admin-empty-icon-wrap">
                    <Users size={48} className="text-cyan-400" />
                  </div>
                  <h3>Roster is Clean &amp; Empty</h3>
                  <p>All previous data has been removed. You can now start adding your custom attendees and uploading photos.</p>
                  <button
                    type="button"
                    className="btn-admin-action btn-primary"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    <span>Add First Attendee</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="admin-empty-icon-wrap">
                    <User size={44} className="text-muted" />
                  </div>
                  <h3>No attendees found matching "{searchTerm}"</h3>
                  <p>Try searching another name or reset your search filter.</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Attendee Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProfile ? 'Edit Attendee Profile' : 'Add New Attendee'}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Photo Preview & Upload Section */}
              <div className="modal-photo-section">
                <div className="photo-preview-circle">
                  {formPhoto ? (
                    <img src={formPhoto} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="preview-placeholder">
                      <User size={36} className="text-cyan-400" />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                <div className="photo-upload-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="upload-btn-row">
                    <button
                      type="button"
                      className="btn-upload-file"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      <span>{formPhoto ? 'Change Photo' : 'Upload From Device'}</span>
                    </button>
                    {formPhoto && (
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => setFormPhoto('')}
                      >
                        <Trash2 size={16} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="photo-tip">Supports JPG, PNG, WEBP. Automatically resized &amp; optimized.</p>
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="input-name">Full Name *</label>
                <input
                  id="input-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kirthikraj"
                  value={formName}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
              </div>

              {/* Event Type */}
              <div className="form-group">
                <label>Event *</label>
                <div className="event-radio-group">
                  <button
                    type="button"
                    className={`radio-btn ${formEvent === 'freshers' ? 'radio-btn--freshers active' : ''}`}
                    onClick={() => {
                      setFormEvent('freshers');
                      if (!formRole || formRole === 'AHS Graduating Senior') {
                        setFormRole('AHS Batch 2026');
                      }
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Freshers Day</span>
                  </button>
                  <button
                    type="button"
                    className={`radio-btn ${formEvent === 'farewell' ? 'radio-btn--farewell active' : ''}`}
                    onClick={() => {
                      setFormEvent('farewell');
                      if (!formRole || formRole === 'AHS Batch 2026') {
                        setFormRole('AHS Graduating Senior');
                      }
                    }}
                  >
                    <GraduationCap size={16} />
                    <span>Farewell Day</span>
                  </button>
                </div>
              </div>

              {/* ID / Register No */}
              <div className="form-group">
                <label htmlFor="input-id">ID / Register Pass Code *</label>
                <input
                  id="input-id"
                  type="text"
                  className="form-input form-input--id"
                  placeholder="e.g. KIRTHIKRAJ"
                  value={formId}
                  onChange={e => setFormId(e.target.value.toUpperCase())}
                  required
                />
                <span className="field-hint">Used for direct link: /profile/{formId || 'ID'}</span>
              </div>

              {/* Role */}
              <div className="form-group">
                <label htmlFor="input-role">Role / Subtitle</label>
                <input
                  id="input-role"
                  type="text"
                  className="form-input"
                  placeholder="e.g. AHS Batch 2026"
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                />
              </div>

              {/* Quote / Message */}
              <div className="form-group">
                <label htmlFor="input-quote">Personalized Quote or Message</label>
                <textarea
                  id="input-quote"
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Stepping into healthcare sciences with curiosity and passion."
                  value={formQuote}
                  onChange={e => setFormQuote(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  {editingProfile ? 'Save Changes' : 'Add Attendee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
