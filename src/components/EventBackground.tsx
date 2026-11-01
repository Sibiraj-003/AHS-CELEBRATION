import React from 'react';
import Aurora from './Aurora';
import './EventBackground.css';

export const EventBackground: React.FC = () => {
  return (
    <div className="event-bg-wrapper" aria-hidden="true">
      <div className="event-bg-base" />
      <div className="event-bg-aurora">
        <Aurora
          amplitude={1.1}
          speed={0.5}
          opacity={0.8}
          mouseInteraction={true}
        />
      </div>
    </div>
  );
};

export default EventBackground;
