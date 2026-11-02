import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProfileSearch from '../components/ProfileSearch';
import ProfileCard from '../components/ProfileCard';
import type { Profile } from '../data/profiles';
import { EVENT_DETAILS } from '../data/profiles';
import { Sparkles, Calendar, MapPin, Award, Settings } from 'lucide-react';
import './Home.css';

export const Home: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleProfileFound = (profile: Profile) => {
    setSelectedProfile(profile);
    // Smooth scroll down to card result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  return (
    <div className="home-page">
      {/* Hero with Single Search Input Box */}
      <Hero>
        <ProfileSearch
          onProfileFound={handleProfileFound}
          onSearchClear={() => setSelectedProfile(null)}
        />

        {/* Search Result Card Section */}
        {selectedProfile && (
          <div className="search-result-wrap" ref={resultRef}>
            <div className="result-indicator">
              <span className="result-line" />
              <span className="result-badge">
                <Sparkles size={14} className="text-cyan-400" />
                OFFICIAL INVITATION FOUND
              </span>
              <span className="result-line" />
            </div>

            <ProfileCard profile={selectedProfile} autoOpenInvitation={true} />
          </div>
        )}
      </Hero>

      {/* Official Common Invitation Section */}
      <section className="common-invitation-section" id="common-invitation">
        <div className="common-invitation-container">
          <div className="common-invitation-badge-wrap">
            <span className="common-invitation-badge">
              <Sparkles size={14} className="badge-sparkle" />
              OFFICIAL INVITATION
            </span>
          </div>

          <h2 className="common-invitation-title">Department Invitation</h2>
          <p className="common-invitation-subtitle">
            Farewell &amp; Freshers Day 2026 • Department of AHS
          </p>

          <div className="common-invitation-card">
            <img
              src="/images/common-invitation.jpg"
              alt="Department of AHS Farewell & Freshers Day Official Invitation"
              className="common-invitation-img"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Event Details Highlights */}
      <section className="event-info-section">
        <div className="event-info-container">
          <div className="event-card-row">
            <div className="event-info-card">
              <Calendar className="info-card-icon text-cyan-400" size={28} />
              <h3>Celebration Date</h3>
              <p className="highlight-text">{EVENT_DETAILS.date || EVENT_DETAILS.year}</p>
              <p className="sub-text">{EVENT_DETAILS.time}</p>
            </div>

            <div className="event-info-card">
              <MapPin className="info-card-icon text-blue-400" size={28} />
              <h3>Grand Venue</h3>
              <p className="highlight-text">{EVENT_DETAILS.venue}</p>
              <p className="sub-text">Krishna College Campus</p>
            </div>

            <div className="event-info-card">
              <Award className="info-card-icon text-purple-400" size={28} />
              <h3>Honors &amp; Welcome</h3>
              <p className="highlight-text">Freshers &amp; Farewell</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-admin-row">
            <Link to="/admin" className="footer-admin-btn">
              <Settings size={15} />
              <span>Attendee &amp; Photo Management (Admin Portal)</span>
            </Link>
          </div>
          <p className="footer-college">{EVENT_DETAILS.college}</p>
          <p className="footer-dep">{EVENT_DETAILS.department} • {EVENT_DETAILS.eventName}</p>
          <p className="footer-copy">© 2026 Department of Allied Health Sciences. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
