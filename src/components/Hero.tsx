import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { EVENT_DETAILS } from '../data/profiles';
import './Hero.css';

interface HeroProps {
  children?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ children }) => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Top College Header with Decorative Wings */}
        <div className="hero-institution">
          <span className="institution-flourish left" />
          <span className="institution-college">{EVENT_DETAILS.college}</span>
          <span className="institution-flourish right" />
        </div>

        {/* Decorative Gem & Star Divider */}
        <div className="hero-ornament-divider">
          <span className="hero-divider-line" />
          <span className="hero-divider-star">✦</span>
          <span className="hero-divider-gem">◆</span>
          <span className="hero-divider-star">✦</span>
          <span className="hero-divider-line" />
        </div>

        {/* Main Title: AHS CELEBRATION 2026 (Grand & Decorative) */}
        <div className="hero-celebration-title-wrap">
          <h2 className="hero-main-title">
            <span className="title-flourish left">❖</span>
            <span className="title-text">{EVENT_DETAILS.eventName}</span>
            <span className="title-flourish right">❖</span>
          </h2>
        </div>

        {/* Large Heading: Freshers Day & Farewell Day */}
        <h1 className="hero-large-heading">
          <span className="heading-freshers">Freshers Day</span>{' '}
          <span className="heading-amp">&amp;</span>{' '}
          <span className="heading-farewell">Farewell Day</span>
        </h1>

        {/* Subtitle / Tagline */}
        <p className="hero-subtitle">
          <Sparkles size={16} className="subtitle-icon text-cyan-400" />
          <span>{EVENT_DETAILS.tagline}</span>
          <Activity size={16} className="subtitle-icon text-violet-400" />
        </p>

        {/* Embedded Children (Search Section & Results) */}
        {children && <div className="hero-interactive-area">{children}</div>}
      </div>
    </section>
  );
};

export default Hero;
