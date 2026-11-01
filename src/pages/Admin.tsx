import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  useProfiles,
  addStoredProfile,
  updateStoredProfile,
  deleteStoredProfile,
  clearAllStoredProfiles,
  EVENT_DETAILS,
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
  AlertCircle,
  QrCode,
  Download,
  Copy,
  LayoutGrid,
  List,
} from 'lucide-react';
import './Admin.css';

// Compresses uploaded image while maintaining clean aspect ratio
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
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
        resolve(canvas.toDataURL('image/jpeg', 0.88));
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRegNo, setFormRegNo] = useState('');
  const [formId, setFormId] = useState('');
  const [formEvent, setFormEvent] = useState<'freshers' | 'farewell'>('freshers');
  const [formPhoto, setFormPhoto] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dedicated QR Code Preview Modal State
  const [selectedQRProfile, setSelectedQRProfile] = useState<Profile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [targetQuickProfileId, setTargetQuickProfileId] = useState<string | null>(null);

  // Auto-generate ID (slug) and RegNo from Name
  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingProfile) {
      const slug = name.trim().toLowerCase().replace(/[\s\W]+/g, '-');
      const reg = name.trim().toUpperCase().replace(/[\s\W]+/g, '_');
      setFormId(slug);
      setFormRegNo(reg);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const openAddModal = () => {
    setEditingProfile(null);
    setFormName('');
    setFormRegNo('');
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
    setFormRegNo(profile.regNo || profile.id);
    setFormId(profile.id);
    setFormEvent((profile.eventType || profile.event) === 'farewell' ? 'farewell' : 'freshers');
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
    } catch {
      showNotification('Failed to process image', 'error');
    }
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetQuickProfileId) return;
    try {
      const base64 = await compressImage(file);
      updateStoredProfile(targetQuickProfileId, { photo: base64 });
      showNotification('Photo uploaded successfully!');
    } catch {
      showNotification('Failed to process image', 'error');
    } finally {
      setTargetQuickProfileId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const triggerQuickUpload = (profileId: string) => {
    setTargetQuickProfileId(profileId);
    quickFileInputRef.current?.click();
  };

  const handleRemovePhoto = (profileId: string) => {
    updateStoredProfile(profileId, { photo: '' });
    showNotification('Photo removed');
  };

  const handleRemoveAllPhotos = () => {
    if (window.confirm('Are you sure you want to remove photos from ALL attendees?')) {
      const cleared = profiles.map(p => ({ ...p, photo: '' }));
      saveAllProfiles(cleared);
      showNotification('All attendee photos cleared');
    }
  };

  const saveAllProfiles = (list: Profile[]) => {
    clearAllStoredProfiles();
    list.forEach(p => addStoredProfile(p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) return;

    const cleanId = (formId.trim() || cleanName.toLowerCase().replace(/[\s\W]+/g, '-')).toLowerCase();
    const cleanRegNo = (formRegNo.trim() || cleanName.toUpperCase().replace(/[\s\W]+/g, '_')).toUpperCase();

    const newProfile: Profile = {
      id: cleanId,
      name: cleanName,
      regNo: cleanRegNo,
      eventType: formEvent,
      event: formEvent,
      photo: formPhoto,
      role: formRole.trim(),
      quote: formQuote.trim(),
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
    if (window.confirm(`Are you sure you want to delete ${profile.name} (${profile.regNo || profile.id})?`)) {
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

  // Download QR Code PNG
  const downloadQR = (profile: Profile) => {
    const canvas = document.getElementById(`qr-canvas-${profile.id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `AHS-2026-QR-${profile.regNo || profile.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showNotification(`Downloaded QR pass for ${profile.name}!`);
    } else {
      showNotification('Could not export QR canvas', 'error');
    }
  };

  const copyQRLink = async (profile: Profile) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/profile/${profile.id}`;
    await navigator.clipboard.writeText(url);
    showNotification('Invitation link copied to clipboard!');
  };

  // Filtered List
  const filtered = profiles.filter(p => {
    const event = p.eventType || p.event;
    const matchesFilter = filterEvent === 'all' || event === filterEvent;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.regNo && p.regNo.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const freshersCount = profiles.filter(p => (p.eventType || p.event) === 'freshers').length;
  const farewellCount = profiles.filter(p => (p.eventType || p.event) === 'farewell').length;
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
            Please enter the administrator password to manage roster attendees, upload photos, and generate QR passes.
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

      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <Link to="/" className="admin-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Portal</span>
          </Link>
          <div className="admin-brand">
            <ShieldCheck size={20} className="text-cyan-400" />
            <div>
              <h1 className="admin-brand-title">AHS Administration Dashboard</h1>
              <p className="admin-brand-sub">{EVENT_DETAILS.eventName} • Attendee &amp; Photo Management</p>
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
          <div className="stat-icon-wrap stat-icon--all">
            <Users size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">TOTAL ATTENDEES</span>
            <span className="stat-val">{profiles.length}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap stat-icon--freshers">
            <Sparkles size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">FRESHERS PROFILES</span>
            <span className="stat-val">{freshersCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap stat-icon--farewell">
            <GraduationCap size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">FAREWELL SENIORS</span>
            <span className="stat-val">{farewellCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap stat-icon--photo">
            <Camera size={22} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">PHOTOS UPLOADED</span>
            <span className="stat-val">{photosCount} / {profiles.length}</span>
          </div>
        </div>
      </section>

      {/* Controls Bar: Search + Filter + View Mode Toggle */}
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

        <div className="admin-controls-right">
          {/* Filter Tabs */}
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
              className={`admin-filter-btn filter-freshers ${filterEvent === 'freshers' ? 'active' : ''}`}
              onClick={() => setFilterEvent('freshers')}
            >
              Freshers ({freshersCount})
            </button>
            <button
              type="button"
              className={`admin-filter-btn filter-farewell ${filterEvent === 'farewell' ? 'active' : ''}`}
              onClick={() => setFilterEvent('farewell')}
            >
              Farewell ({farewellCount})
            </button>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="admin-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View (Upload, Preview, Save, Generate QR)"
            >
              <LayoutGrid size={16} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table Roster View"
            >
              <List size={16} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Roster Container */}
      <main className="admin-roster">
        {filtered.length > 0 ? (
          viewMode === 'cards' ? (
            /* ==============================================================
               CARD VIEW (Matches user's requested layout):
               Freshers / Farewell
               Name
               Reg No: ...
               [ Upload Photo ] [ Preview ] [ Save ] [ Generate QR ]
               ============================================================== */
            <div className="admin-cards-grid">
              {filtered.map(profile => {
                const isFreshers = (profile.eventType || profile.event) === 'freshers';
                const hasPhoto = Boolean(profile.photo);

                return (
                  <div
                    key={profile.id}
                    className={`profile-card-item ${isFreshers ? 'card--freshers' : 'card--farewell'}`}
                  >
                    {/* Event Category Header */}
                    <div className="card-item-header">
                      <span className={`card-event-badge ${isFreshers ? 'badge-cyan' : 'badge-purple'}`}>
                        {isFreshers ? 'Freshers Day' : 'Farewell Day'}
                      </span>
                      <span className="card-url-tag">/profile/{profile.id}</span>
                    </div>

                    <div className="card-divider" />

                    {/* Circular Photo Frame Preview */}
                    <div className="card-photo-slot">
                      <div className={`card-circular-frame ${hasPhoto ? 'has-img' : 'no-img'}`}>
                        {hasPhoto ? (
                          <img
                            src={profile.photo}
                            alt={profile.name}
                            className="card-uploaded-img"
                          />
                        ) : (
                          <div className="card-photo-initials">
                            <span>{profile.name[0]}</span>
                            <User size={18} className="opacity-60" />
                          </div>
                        )}
                      </div>
                      <span className="frame-laurel-accent" />
                    </div>

                    {/* Identity */}
                    <div className="card-identity">
                      <h3 className="card-person-name">{profile.name}</h3>
                      <div className="card-regno-pill">
                        <span>Reg No : {profile.regNo || profile.id}</span>
                      </div>
                      {profile.role && <p className="card-role-text">{profile.role}</p>}
                    </div>

                    {/* Dedicated Actions: Upload Photo, Preview, Save/Edit, Generate QR */}
                    <div className="card-action-buttons">
                      <button
                        type="button"
                        className="btn-card-cta btn-upload-cta"
                        onClick={() => triggerQuickUpload(profile.id)}
                        title="Upload or replace photo"
                      >
                        <Upload size={14} />
                        <span>{hasPhoto ? 'Replace Photo' : 'Upload Photo'}</span>
                      </button>

                      <Link
                        to={`/profile/${profile.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-card-cta btn-preview-cta"
                        title="Preview personalized invitation poster"
                      >
                        <ExternalLink size={14} />
                        <span>Preview</span>
                      </Link>

                      <button
                        type="button"
                        className="btn-card-cta btn-edit-cta"
                        onClick={() => openEditModal(profile)}
                        title="Edit profile & Save"
                      >
                        <Edit size={14} />
                        <span>Edit / Save</span>
                      </button>

                      <button
                        type="button"
                        className="btn-card-cta btn-qr-cta"
                        onClick={() => setSelectedQRProfile(profile)}
                        title="Generate and view unique QR code pass"
                      >
                        <QrCode size={14} />
                        <span>Generate QR</span>
                      </button>
                    </div>

                    {/* Bottom Delete row */}
                    <div className="card-item-footer">
                      <button
                        type="button"
                        className="btn-card-delete"
                        onClick={() => handleDelete(profile)}
                        title="Delete attendee from roster"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Hidden canvas for downloading QR code directly if needed */}
                    <div style={{ display: 'none' }}>
                      <QRCodeCanvas
                        id={`qr-canvas-${profile.id}`}
                        value={typeof window !== 'undefined' ? `${window.location.origin}/profile/${profile.id}` : `/profile/${profile.id}`}
                        size={300}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ==============================================================
               TABLE ROSTER VIEW
               ============================================================== */
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Reg No</th>
                    <th>Event</th>
                    <th>Direct Link</th>
                    <th>QR Pass</th>
                    <th>Photo Actions</th>
                    <th>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(profile => {
                    const isFreshers = (profile.eventType || profile.event) === 'freshers';
                    const hasPhoto = Boolean(profile.photo);

                    return (
                      <tr
                        key={profile.id}
                        className={`admin-row ${isFreshers ? 'admin-row--freshers' : 'admin-row--farewell'}`}
                      >
                        {/* Circular Avatar */}
                        <td className="cell-avatar">
                          <div className={`admin-avatar-frame ${hasPhoto ? 'has-img' : 'no-img'}`}>
                            {hasPhoto ? (
                              <img
                                src={profile.photo}
                                alt={profile.name}
                                className="admin-avatar-img"
                              />
                            ) : (
                              <span className="admin-avatar-initials">{profile.name[0]}</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="cell-name">
                          <strong>{profile.name}</strong>
                          {profile.role && <div className="cell-sub">{profile.role}</div>}
                        </td>

                        {/* Reg No */}
                        <td className="cell-id">
                          <code className="id-badge">{profile.regNo || profile.id}</code>
                        </td>

                        {/* Event */}
                        <td className="cell-event">
                          <EventBadge event={isFreshers ? 'freshers' : 'farewell'} size="sm" />
                        </td>

                        {/* Direct URL */}
                        <td className="cell-url">
                          <Link to={`/profile/${profile.id}`} target="_blank" rel="noreferrer" className="table-url-link">
                            <span>/profile/{profile.id}</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>

                        {/* QR Code Pass button */}
                        <td className="cell-qr">
                          <button
                            type="button"
                            className="btn-table-qr"
                            onClick={() => setSelectedQRProfile(profile)}
                            title="Generate and download QR pass"
                          >
                            <QrCode size={15} />
                            <span>View QR</span>
                          </button>
                        </td>

                        {/* Photo Actions */}
                        <td className="cell-photo-action">
                          <div className="photo-actions-wrap">
                            <button
                              type="button"
                              className="btn-photo-action btn-upload-photo"
                              onClick={() => triggerQuickUpload(profile.id)}
                              title={hasPhoto ? 'Replace photo' : 'Upload photo'}
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
                              title="Preview invitation poster"
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
            </div>
          )
        ) : (
          /* ==============================================================
             CLEAN EMPTY STATE
             ============================================================== */
          <div className="admin-empty-state">
            {profiles.length === 0 ? (
              <>
                <div className="admin-empty-icon-wrap">
                  <Users size={48} className="text-cyan-400" />
                </div>
                <h3>Roster is Clean &amp; Empty</h3>
                <p>Start by adding attendee profiles. Each attendee will get a dedicated QR code pass and personalized invitation poster.</p>
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
                <p>Try searching another name or reset your event filter.</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* ==============================================================
         ADD / EDIT ATTENDEE MODAL
         ============================================================== */}
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
              {/* Photo Upload and Preview Section */}
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
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="photo-tip">
                    Will appear inside the glowing laurel circular frame with <code>object-fit: cover</code>.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="input-name">Full Name *</label>
                <input
                  id="input-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lakshmi"
                  value={formName}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
              </div>

              {/* Reg No */}
              <div className="form-group">
                <label htmlFor="input-regno">Register Number (Reg. No) *</label>
                <input
                  id="input-regno"
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. LAKSHMI or 2026AHS01"
                  value={formRegNo}
                  onChange={e => setFormRegNo(e.target.value.toUpperCase())}
                  required
                />
                <small className="form-hint">Displayed on the invitation pill: <code>Reg. No : {formRegNo || 'YOUR_ID'}</code></small>
              </div>

              {/* URL Slug ID */}
              <div className="form-group">
                <label htmlFor="input-id">Profile URL Slug *</label>
                <input
                  id="input-id"
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. lakshmi"
                  value={formId}
                  onChange={e => setFormId(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'))}
                  required
                />
                <small className="form-hint">QR Destination: <code>/profile/{formId || 'name'}</code></small>
              </div>

              {/* Event Type (Freshers vs Farewell) */}
              <div className="form-group">
                <label>Event Classification *</label>
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
                    <span>Freshers Day (Cyan Theme)</span>
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
                    <span>Farewell Day (Purple Theme)</span>
                  </button>
                </div>
              </div>

              {/* Role / Batch */}
              <div className="form-group">
                <label htmlFor="input-role">Department / Batch / Specialization</label>
                <input
                  id="input-role"
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Sc Cardiac Care / AHS Batch 2026"
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  {editingProfile ? 'Update & Save Profile' : 'Save Attendee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
         DEDICATED QR CODE PASS PREVIEW & DOWNLOAD MODAL
         ============================================================== */}
      {selectedQRProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedQRProfile(null)}>
          <div className="modal-card qr-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Personalized Attendee QR Pass</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedQRProfile(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="qr-modal-body">
              {/* QR Code Canvas */}
              <div className="qr-modal-preview-box">
                <QRCodeCanvas
                  id={`qr-modal-canvas-${selectedQRProfile.id}`}
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/profile/${selectedQRProfile.id}`
                      : `/profile/${selectedQRProfile.id}`
                  }
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Attendee Details */}
              <div className="qr-modal-info">
                <span className={`qr-badge ${(selectedQRProfile.eventType || selectedQRProfile.event) === 'freshers' ? 'badge-cyan' : 'badge-purple'}`}>
                  {(selectedQRProfile.eventType || selectedQRProfile.event) === 'freshers' ? 'Freshers Day 2026' : 'Farewell Day 2026'}
                </span>
                <h3 className="qr-attendee-name">{selectedQRProfile.name}</h3>
                <p className="qr-attendee-regno">Reg. No : {selectedQRProfile.regNo || selectedQRProfile.id}</p>
                <div className="qr-link-box">
                  <span className="qr-url-text">
                    {typeof window !== 'undefined' ? `${window.location.origin}/profile/${selectedQRProfile.id}` : `/profile/${selectedQRProfile.id}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="qr-modal-actions">
                <button
                  type="button"
                  className="btn-qr-modal btn-download-qr"
                  onClick={() => downloadQR(selectedQRProfile)}
                >
                  <Download size={16} />
                  <span>Download QR PNG</span>
                </button>
                <button
                  type="button"
                  className="btn-qr-modal btn-copy-link"
                  onClick={() => copyQRLink(selectedQRProfile)}
                >
                  <Copy size={16} />
                  <span>Copy Direct URL</span>
                </button>
                <Link
                  to={`/profile/${selectedQRProfile.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-qr-modal btn-open-invitation"
                >
                  <ExternalLink size={16} />
                  <span>Open Live Invitation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
