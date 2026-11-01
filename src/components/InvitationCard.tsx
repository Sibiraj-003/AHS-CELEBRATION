import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Calendar, MapPin, Clock, Sparkles, Heart } from 'lucide-react';
import type { Profile } from '../data/profiles';
import { EVENT_DETAILS } from '../data/profiles';
import EventBadge from './EventBadge';
import './InvitationCard.css';

interface InvitationCardProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  profile,
  isOpen,
  onClose
}) => {
  const isFreshers = profile.event === 'freshers';

  useEffect(() => {
    if (isOpen) {
      // Fire festive confetti effect!
      const colors = isFreshers
        ? ['#1677FF', '#42D9FF', '#38BDF8', '#FFFFFF']
        : ['#7C5CFF', '#C084FC', '#F59E0B', '#FFFFFF'];

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: colors,
        disableForReducedMotion: true
      });
    }
  }, [isOpen, isFreshers]);

  if (!isOpen) return null;

  return (
    <div className="invitation-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`invitation-modal ${isFreshers ? 'invitation-modal--freshers' : 'invitation-modal--farewell'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Holographic Border Glow */}
        <div className="invitation-glow" />

        {/* Close Button */}
        <button
          type="button"
          className="invitation-close-btn"
          onClick={onClose}
          aria-label="Close Invitation"
        >
          <X size={20} />
        </button>

        {/* Header Institution Branding */}
        <div className="invitation-header">
          <span className="invitation-crest">AHS</span>
          <p className="invitation-college">{EVENT_DETAILS.college}</p>
          <p className="invitation-department">{EVENT_DETAILS.department}</p>
        </div>

        {/* Badge */}
        <div className="invitation-badge-wrap">
          <EventBadge event={profile.event} size="lg" />
        </div>

        {/* Salutation & Personalized Message */}
        <div className="invitation-body">
          <h2 className="invitation-headline">
            {isFreshers ? "You're Invited" : "Honoring Your Journey"}
          </h2>
          <h3 className="invitation-subheadline">
            {isFreshers ? "Freshers Day 2026" : "Farewell Day 2026"}
          </h3>

          <div className="invitation-message-box">
            <p className="invitation-greeting">Dear {profile.name},</p>
            <p className="invitation-text">
              {isFreshers ? (
                <>
                  You are warmly invited to celebrate <strong>Freshers Day 2026</strong>. Step into this vibrant chapter of medical brilliance, discovery, and healthcare leadership with open hearts and proud camaraderie.
                </>
              ) : (
                <>
                  You are warmly invited to celebrate <strong>Farewell Day 2026</strong>. We salute your relentless dedication, clinical achievements, and cherish every single memory built together in our halls.
                </>
              )}
            </p>
            {profile.quote && (
              <blockquote className="invitation-quote">
                &ldquo;{profile.quote}&rdquo;
              </blockquote>
            )}
          </div>

          {/* Event Schedules & Logistics */}
          <div className="invitation-logistics">
            <div className="logistic-item">
              <Calendar size={16} className="logistic-item__icon" />
              <div>
                <span className="logistic-label">Event Year</span>
                <span className="logistic-val">{EVENT_DETAILS.year}</span>
              </div>
            </div>
            <div className="logistic-item">
              <Clock size={16} className="logistic-item__icon" />
              <div>
                <span className="logistic-label">Time</span>
                <span className="logistic-val">{EVENT_DETAILS.time}</span>
              </div>
            </div>
            <div className="logistic-item">
              <MapPin size={16} className="logistic-item__icon" />
              <div>
                <span className="logistic-label">Venue</span>
                <span className="logistic-val">{EVENT_DETAILS.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invitation Footer */}
        <div className="invitation-footer">
          <div className="invitation-attendee">
            <span className="attendee-label">OFFICIAL PASS / REGISTRATION:</span>
            <span className="attendee-code">{profile.id}</span>
          </div>

          <p className="invitation-tagline">
            {isFreshers ? (
              <Sparkles size={14} className="inline-icon text-cyan-400" />
            ) : (
              <Heart size={14} className="inline-icon text-purple-400" />
            )}{' '}
            {EVENT_DETAILS.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
