import React, { useState } from 'react';
import { Mail, Sparkles, User, CheckCircle2 } from 'lucide-react';
import type { Profile } from '../data/profiles';
import EventBadge from './EventBadge';
import QRCodeCard from './QRCodeCard';
import InvitationCard from './InvitationCard';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: Profile;
  autoOpenInvitation?: boolean;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  autoOpenInvitation = false,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpenInvitation);
  const [imgError, setImgError] = useState(false);

  const isFreshers = profile.event === 'freshers';

  // Get initials for graceful avatar fallback
  const initials = profile.name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div
        className={`profile-card ${isFreshers ? 'profile-card--freshers' : 'profile-card--farewell'} ${className}`}
        id={`profile-card-${profile.id}`}
      >
        {/* Glow ambient layer */}
        <div className="profile-card__ambient" />

        {/* Top Header Badge */}
        <div className="profile-card__header">
          <EventBadge event={profile.event || profile.eventType || 'freshers'} size="md" />
        </div>

        {/* Portrait Photo */}
        <div className="profile-photo-wrapper">
          <div className="profile-photo-ring">
            {profile.photo && !imgError ? (
              <img
                src={profile.photo}
                alt={`${profile.name} portrait`}
                className="profile-photo-img"
                onError={() => setImgError(true)}
                loading="eager"
              />
            ) : (
              <div className="profile-photo-fallback">
                <span className="profile-photo-initials">{initials}</span>
                <User size={16} className="profile-photo-icon" />
              </div>
            )}
          </div>
          <span className="profile-photo-status">
            <CheckCircle2 size={14} className="status-badge-icon" />
          </span>
        </div>

        {/* Person Identity */}
        <div className="profile-info">
          <h3 className="profile-name">{profile.name}</h3>
          {!isFreshers && <p className="profile-role">AHS Graduating Senior</p>}
        </div>

        {/* Open Invitation CTA Button */}
        <div className="profile-cta-section">
          <button
            type="button"
            className="btn-open-invitation"
            onClick={() => setIsModalOpen(true)}
            id="open-invitation-btn"
          >
            <Mail size={18} className="btn-icon" />
            <span>Open Invitation</span>
            <Sparkles size={16} className="btn-sparkle" />
          </button>
        </div>

        {/* Dynamic QR Code */}
        <div className="profile-qr-section">
          <QRCodeCard
            profileId={profile.id}
            name={profile.name}
            event={profile.event || profile.eventType || 'freshers'}
            size={155}
          />
        </div>
      </div>

      {/* Modal Popup for Invitation */}
      <InvitationCard
        profile={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProfileCard;
