import React from 'react';
import Particles from './Particles';
import './EventBackground.css';

export const EventBackground: React.FC = () => {
  return (
    <div className="event-bg-wrapper" aria-hidden="true">
      <Particles
        particleColors={["#0c40ff", "#fffdfe", "#d71717"]}
        particleCount={1370}
        particleSpread={10}
        speed={0.16}
        particleBaseSize={80}
        glow={0.5}
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
