import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { findProfileById, addStoredProfile, EVENT_DETAILS, type Profile as ProfileType } from '../data/profiles';
import OfficialInvitation from '../components/OfficialInvitation';
import QRCodeCard from '../components/QRCodeCard';
import { ArrowLeft, ShieldCheck, AlertCircle, Home as HomeIcon, QrCode } from 'lucide-react';
import './Profile.css';

export const Profile: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [searchParams] = useSearchParams();
  const [showQR, setShowQR] = useState(false);

  const profile = useMemo(() => {
    if (!profileId) return undefined;

    // 1. Try finding in local storage roster
    const existing = findProfileById(profileId);
    if (existing) return existing;

    // 2. If not found in this browser's localStorage (e.g. scanned on a new phone),
    // synthesize from slug and URL parameters:
    const paramName = searchParams.get('name');
    const paramReg = searchParams.get('reg') || searchParams.get('regNo');
    const paramEvent = (searchParams.get('event') || searchParams.get('eventType')) as 'freshers' | 'farewell' | null;
    const paramPhoto = searchParams.get('photo');

    // Humanize slug into pretty display name: e.g. "sowndariya" -> "Sowndariya", "harini-varsha" -> "Harini Varsha"
    const fallbackName = profileId
      .split(/[-_]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .trim();

    const cleanRegNo = paramReg || profileId.toUpperCase().replace(/[-\s]/g, '_');
    const cleanEventType = paramEvent === 'farewell' ? 'farewell' : 'freshers';

    const synthesized: ProfileType = {
      id: profileId.toLowerCase().replace(/[\s_]+/g, '-'),
      name: paramName || fallbackName,
      regNo: cleanRegNo,
      eventType: cleanEventType,
      event: cleanEventType,
      photo: paramPhoto || '',
      role: cleanEventType === 'farewell' ? 'AHS Graduating Senior' : 'AHS Batch 2026',
    };

    // Auto-save so subsequent navigation or refresh retains this profile on this device
    try {
      addStoredProfile(synthesized);
    } catch {
      // quota safeguard
    }

    return synthesized;
  }, [profileId, searchParams]);

  const isFreshers = profile ? (profile.eventType || profile.event) === 'freshers' : true;

  return (
    <div className="profile-page">
      {/* Top Navigation Bar */}
      <nav className="profile-nav">
        <Link to="/" className="nav-back-link">
          <ArrowLeft size={18} />
          <span>Back to Event Portal</span>
        </Link>

        <div className="nav-branding">
          <ShieldCheck size={16} className="text-cyan-400" />
          <span className="nav-college">{EVENT_DETAILS.department}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="profile-main">
        {profile ? (
          <div className="profile-view-wrapper">
            <div className="profile-view-header">
              <span className={`profile-view-tag ${isFreshers ? 'tag-freshers' : 'tag-farewell'}`}>
                {isFreshers ? 'FRESHERS DAY 2026' : 'FAREWELL DAY 2026'}
              </span>
              <h1 className="profile-view-title">{profile.name}</h1>
              <p className="profile-view-sub">
                Reg. No: <strong>{profile.regNo || profile.id}</strong> • Official Personalized Digital Pass
              </p>
            </div>

            {/* Official Invitation Poster matching exact reference designs */}
            <OfficialInvitation profile={profile} />

            {/* Additional Pass Controls */}
            <div className="profile-view-actions">
              <button
                type="button"
                className="btn-toggle-qr"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode size={18} />
                <span>{showQR ? 'Hide Digital QR Pass' : 'View Digital QR Pass'}</span>
              </button>

              <Link to="/" className="profile-home-btn">
                <HomeIcon size={16} />
                <span>Event Home Portal</span>
              </Link>
            </div>

            {/* Digital QR Pass Box */}
            {showQR && (
              <div className="profile-qr-box-wrap">
                <QRCodeCard
                  profileId={profile.id}
                  name={profile.name}
                  event={profile.eventType || profile.event || 'freshers'}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="profile-not-found">
            <AlertCircle size={48} className="not-found-icon" />
            <h2>We couldn't find your invitation.</h2>
            <p>Please check the invitation link or search by your name on the main portal.</p>
            <Link to="/" className="btn-return-home">
              <ArrowLeft size={16} />
              <span>Go to Event Home</span>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="profile-footer">
        <p>{EVENT_DETAILS.college} • {EVENT_DETAILS.eventName}</p>
      </footer>
    </div>
  );
};

export default Profile;
