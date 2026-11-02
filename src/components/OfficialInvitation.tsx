import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  HeartHandshake,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { EVENT_DETAILS, type Profile } from '../data/profiles';
import './OfficialInvitation.css';

interface OfficialInvitationProps {
  profile: Profile;
  className?: string;
  showActions?: boolean;
}

export const OfficialInvitation: React.FC<OfficialInvitationProps> = ({
  profile,
  className = '',
}) => {
  const isFreshers = (profile.eventType || profile.event) === 'freshers';
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fire celebratory confetti on view
    const colors = isFreshers
      ? ['#1677FF', '#42D9FF', '#38BDF8', '#FFFFFF', '#0284C7']
      : ['#7C5CFF', '#C084FC', '#F472B6', '#FFFFFF', '#A855F7'];

    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.55 },
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

  return (
    <div className={`glass-ticket-container ${isFreshers ? 'theme-freshers' : 'theme-farewell'} ${className}`}>
      {/* Main Large Glassmorphic Ticket Card */}
      <div className="glass-ticket-card glass-ticket-card--grand" ref={cardRef}>
        {/* Glow ambient accent shapes */}
        <div className="ticket-glow-orb ticket-glow-orb--top" />
        <div className="ticket-glow-orb ticket-glow-orb--bot" />

        {/* Side ticket notch punchouts */}
        <span className="ticket-notch ticket-notch--left" />
        <span className="ticket-notch ticket-notch--right" />

        {/* 1. Header & Institution Brand */}
        <header className="ticket-header">
          <div className="institution-brand">
            <ShieldCheck size={22} className="institution-icon" />
            <div className="institution-titles">
              <h4 className="college-name">{EVENT_DETAILS.college}</h4>
              <p className="dept-name">{EVENT_DETAILS.department}</p>
            </div>
          </div>

          <div className="ticket-header-badges">
            <span className="ticket-kicker-badge">YOU'RE INVITED</span>
            <div className="ticket-event-badge">
              {isFreshers ? (
                <Sparkles size={16} className="badge-icon" />
              ) : (
                <GraduationCap size={16} className="badge-icon" />
              )}
              <span>{isFreshers ? 'Freshers Day 2026' : 'Farewell Day 2026'}</span>
            </div>
          </div>
        </header>

        {/* 2. Honored Attendee Section (Large Square Avatar) */}
        <section className="ticket-attendee-section ticket-attendee-section--grand">
          {/* Avatar with purple/cyan ring */}
          <div className="attendee-avatar-wrap">
            <div className="attendee-avatar-ring">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={`${profile.name} portrait`}
                  className="attendee-photo-img"
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
                <div className="attendee-photo-fallback">
                  <span className="avatar-initials">{initials}</span>
                  <User size={36} className="avatar-empty-icon" />
                </div>
              )}
            </div>
            <span className="verified-check" title="Verified Attendee Pass">
              <CheckCircle2 size={18} />
            </span>
          </div>

          {/* Attendee Name & Badges */}
          <div className="attendee-identity">
            <span className="invitation-kicker">HONORED INVITATION FOR</span>
            <h2 className="attendee-name">{profile.name}</h2>
            {!isFreshers && (
              <div className="attendee-meta-pills">
                <span className="meta-pill-role">
                  AHS Graduating Senior
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 3. Personalized Invitation Content Message */}
        <section className="ticket-message-card ticket-message-card--grand">
          <div className="msg-header-row">
            <HeartHandshake size={20} className="msg-icon" />
            <span className="msg-title">OFFICIAL INVITATION</span>
          </div>
          <div className="invitation-personal-greeting">
            <p className="greeting-lead">
              Dear <span className="greeting-name">{profile.name}</span>,
            </p>
            <p className="ticket-warm-note">
              {isFreshers ? (
                <>
                  You are warmly invited to celebrate <strong>Freshers Day 2026</strong>.
                </>
              ) : (
                <>
                  You are warmly invited to celebrate <strong>Farewell Day 2026</strong>.
                </>
              )}
            </p>
          </div>

          {/* Medical heartbeat heartbeat accent line */}
          <div className="ecg-pulse-accent">
            <span className="ecg-pulse-line" />
            <Activity size={18} className="ecg-pulse-icon" />
            <span className="ecg-pulse-line" />
          </div>
        </section>

        {/* Perforated Divider */}
        <div className="ticket-perforation">
          <span className="perforation-line" />
        </div>

        {/* 4. Event Logistics */}
        <footer className="ticket-stub-footer ticket-stub-footer--grand">
          <div className="ticket-logistics-grid ticket-logistics-grid--grand">
            <div className="logistics-item">
              <Calendar size={18} className="logistics-icon" />
              <div className="logistics-text">
                <span className="logistics-label">DATE</span>
                <span className="logistics-val">{EVENT_DETAILS.date || 'Nov 4, 2026'}</span>
              </div>
            </div>

            <div className="logistics-item">
              <Clock size={18} className="logistics-icon" />
              <div className="logistics-text">
                <span className="logistics-label">TIME</span>
                <span className="logistics-val">{EVENT_DETAILS.time || '10:00 AM'}</span>
              </div>
            </div>

            <div className="logistics-item logistics-item--full">
              <MapPin size={18} className="logistics-icon" />
              <div className="logistics-text">
                <span className="logistics-label">VENUE</span>
                <span className="logistics-val">{EVENT_DETAILS.venue || 'Near Boys Hostel'}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OfficialInvitation;
