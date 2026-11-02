import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Profile } from '../data/profiles';
import OfficialInvitation from './OfficialInvitation';
import './InvitationCard.css';

interface InvitationCardProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="invitation-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="invitation-modal-outer" onClick={e => e.stopPropagation()}>
        <div className="invitation-modal-topbar">
          <button
            type="button"
            className="invitation-modal-close"
            onClick={onClose}
            aria-label="Close Invitation"
          >
            <X size={18} />
            <span className="close-label">Close</span>
          </button>
        </div>

        {/* Official Invitation Poster */}
        <OfficialInvitation profile={profile} showActions={true} />
      </div>
    </div>
  );
};

export default InvitationCard;
