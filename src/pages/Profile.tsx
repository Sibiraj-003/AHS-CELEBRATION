import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findProfileById, EVENT_DETAILS } from '../data/profiles';
import ProfileCard from '../components/ProfileCard';
import { ArrowLeft, ShieldCheck, AlertCircle, Home as HomeIcon } from 'lucide-react';
import './Profile.css';

export const Profile: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();

  const profile = useMemo(() => {
    if (!profileId) return undefined;
    return findProfileById(profileId);
  }, [profileId]);

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
              <span className="profile-view-tag">VERIFIED ATTENDEE PASS</span>
              <h1 className="profile-view-title">Personalized Invitation</h1>
              <p className="profile-view-sub">
                Official digital pass for <strong>{profile.name}</strong> • {profile.event === 'freshers' ? 'Freshers Day 2026' : 'Farewell Day 2026'}
              </p>
            </div>

            {/* The Result Card */}
            <ProfileCard profile={profile} autoOpenInvitation={false} />

            <div className="profile-view-actions">
              <Link to="/" className="profile-home-btn">
                <HomeIcon size={16} />
                <span>Search Another Attendee</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="profile-not-found">
            <AlertCircle size={48} className="not-found-icon" />
            <h2>We couldn't find your invitation.</h2>
            <p>Please check the invitation code or search by your name on the main portal.</p>
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
