import React from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';
import './EventBadge.css';

interface EventBadgeProps {
  event: 'freshers' | 'farewell';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EventBadge: React.FC<EventBadgeProps> = ({
  event,
  size = 'md',
  className = ''
}) => {
  const isFreshers = event === 'freshers';

  return (
    <div
      className={`event-badge event-badge--${event} event-badge--${size} ${className}`}
      role="status"
      aria-label={isFreshers ? 'Freshers Day' : 'Farewell Day'}
    >
      <span className="event-badge__glow" />
      <span className="event-badge__content">
        {isFreshers ? (
          <>
            <Sparkles className="event-badge__icon" size={size === 'lg' ? 18 : 14} />
            <span className="event-badge__text">FRESHERS DAY</span>
          </>
        ) : (
          <>
            <GraduationCap className="event-badge__icon" size={size === 'lg' ? 18 : 14} />
            <span className="event-badge__text">FAREWELL DAY</span>
          </>
        )}
      </span>
    </div>
  );
};

export default EventBadge;
