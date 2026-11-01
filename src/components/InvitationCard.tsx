import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="invitation-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="invitation-modal-outer" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="invitation-modal-close"
          onClick={onClose}
          aria-label="Close Invitation"
        >
          <X size={22} />
        </button>

        {/* Official Invitation Poster */}
        <OfficialInvitation profile={profile} showActions={true} />
      </div>
    </div>
  );
};

export default InvitationCard;
