import React from 'react';
import Particles from './Particles';
import './EventBackground.css';

export const EventBackground: React.FC = () => {
  return (
    <div className="event-bg-wrapper" aria-hidden="true">
      <Particles
        particleColors={["#E6C687", "#34D399", "#F7E7C4", "#10B981", "#C59E50", "#FFFFFF"]}
        particleCount={1370}
        particleSpread={10}
        speed={0.15}
        particleBaseSize={85}
        glow={0.55}
        twinkle={0.35}
        moveParticlesOnHover={true}
        hoverEffect="parallax"
        sizeRandomness={0.7}
        shape="sparkle"
        particleHoverFactor={1.15}
        disableRotation={true}
        className="event-bg-particles"
      />
    </div>
  );
};

export default EventBackground;
