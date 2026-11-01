import React from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { EVENT_DETAILS } from '../data/profiles';
import './Hero.css';

interface HeroProps {
  children?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ children }) => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Top College Header Badge */}
        <div className="hero-institution">
          <div className="institution-pill">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span className="institution-college">{EVENT_DETAILS.college}</span>
          </div>
        </div>

        {/* Small Label */}
        <div className="hero-department-wrap">
          <span className="hero-pulse-dot" />
          <span className="hero-small-label">{EVENT_DETAILS.department}</span>
          <span className="hero-badge-tag">EST. 2026</span>
        </div>

        {/* Main Title */}
        <h2 className="hero-main-title">{EVENT_DETAILS.eventName}</h2>

        {/* Large Heading */}
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
