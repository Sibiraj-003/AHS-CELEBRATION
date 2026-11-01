import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, Share2, User, Calendar, MapPin, Clock } from 'lucide-react';
import type { Profile } from '../data/profiles';
import './OfficialInvitation.css';

interface OfficialInvitationProps {
  profile: Profile;
  className?: string;
  showActions?: boolean;
}

export const OfficialInvitation: React.FC<OfficialInvitationProps> = ({
  profile,
  className = '',
  showActions = true,
}) => {
  const isFreshers = (profile.eventType || profile.event) === 'freshers';
  const templateSrc = isFreshers
    ? '/templates/freshers-template.jpg'
    : '/templates/farewell-template.jpg';

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fire celebratory confetti on view
    const colors = isFreshers
      ? ['#1677FF', '#42D9FF', '#38BDF8', '#FFFFFF', '#0284C7']
      : ['#7C5CFF', '#C084FC', '#F472B6', '#FFFFFF', '#A855F7'];

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });
  }, [isFreshers]);

  const initials = profile.name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Official AHS Celebration 2026 Invitation`,
          text: `Personalized ${isFreshers ? 'Freshers Day' : 'Farewell Day'} 2026 invitation for ${profile.name}!`,
          url,
        });
      } catch {
        // User dismissed
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Invitation link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`official-invitation-container ${isFreshers ? 'theme-freshers' : 'theme-farewell'} ${className}`}>
      {/* Action Toolbar */}
      {showActions && (
        <div className="invitation-action-toolbar no-print">
          <button type="button" className="toolbar-btn btn-share" onClick={handleShare} title="Share invitation link">
            <Share2 size={16} />
            <span>Share Invitation</span>
          </button>
          <button type="button" className="toolbar-btn btn-print" onClick={handlePrint} title="Print or save as PDF">
            <Download size={16} />
            <span>Save / Print Invitation</span>
          </button>
        </div>
      )}

      {/* Main Poster Card */}
      <div className="invitation-poster-card" ref={cardRef}>
        {/* Background Official Template Image */}
        <img
          src={templateSrc}
          alt={`${isFreshers ? 'Freshers Day' : 'Farewell Day'} 2026 Official Invitation`}
          className="invitation-template-img"
        />

        {/* 1. Exact Center Circular Photo Frame (Inside Laurel Wreath) */}
        <div className="invitation-photo-slot">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`${profile.name} portrait`}
              className="invitation-photo-img"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = 'true';
                  target.src = `/photos/${profile.id.toLowerCase().replace(/[^a-z0-9_-]/g, '')}.jpg`;
                }
              }}
            />
          ) : (
            <div className="invitation-photo-empty">
              <span className="photo-initials">{initials}</span>
              <User size={22} className="photo-empty-icon" />
            </div>
          )}
        </div>

        {/* 2. Ribbon Name Overlay */}
        <div className="invitation-ribbon-name" title={profile.name}>
          <span className="ribbon-text">{profile.name}</span>
        </div>

        {/* 3. Reg. No. Pill Badge Overlay */}
        <div className="invitation-regno-pill">
          <span>Reg. No : {profile.regNo || profile.id}</span>
        </div>

        {/* 4. Personalized Salutation Block Overlay */}
        <div className="invitation-greeting-block">
          <p className="greeting-salutation">Dear {profile.name},</p>
          <p className="greeting-sub">You are warmly invited to celebrate</p>
          <p className="greeting-event-title">
            {isFreshers ? 'Freshers Day 2026.' : 'Farewell Day 2026.'}
          </p>
        </div>
      </div>

      {/* Event Details Quick Bar */}
      <div className="invitation-quick-meta no-print">
        <div className="meta-pill">
          <Calendar size={14} className="meta-icon" />
          <span>Feb 20, 2026</span>
        </div>
        <div className="meta-pill">
          <Clock size={14} className="meta-icon" />
          <span>10:00 AM</span>
        </div>
        <div className="meta-pill">
          <MapPin size={14} className="meta-icon" />
          <span>AHS Auditorium</span>
        </div>
      </div>
    </div>
  );
};

export default OfficialInvitation;
