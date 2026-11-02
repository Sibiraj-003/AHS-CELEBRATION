import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProfileSearch from '../components/ProfileSearch';
import ProfileCard from '../components/ProfileCard';
import type { Profile } from '../data/profiles';
import { EVENT_DETAILS, useProfiles } from '../data/profiles';
import { Sparkles, GraduationCap, Users, Calendar, MapPin, Award, Settings } from 'lucide-react';
import './Home.css';

export const Home: React.FC = () => {
  const [profiles] = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'freshers' | 'farewell'>('all');
  const resultRef = useRef<HTMLDivElement>(null);

  const freshersCount = profiles.filter(p => p.event === 'freshers').length;
  const farewellCount = profiles.filter(p => p.event === 'farewell').length;

  const handleProfileFound = (profile: Profile) => {
    setSelectedProfile(profile);
    // Smooth scroll down to card result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const filteredProfiles = profiles.filter(p => {
    if (activeTab === 'freshers') return p.event === 'freshers';
    if (activeTab === 'farewell') return p.event === 'farewell';
    return true;
  });

  return (
    <div className="home-page">
      {/* Top Floating Utility Bar with Admin Access */}
      <div className="home-top-bar">
        <div className="home-top-left">
          <span className="live-dot" />
          <span className="live-text">AHS Invitation Portal 2026</span>
        </div>
        <Link to="/admin" className="admin-portal-link" title="Open Admin Portal to add attendees and manage photos">
          <Settings size={15} />
          <span>Admin Portal</span>
        </Link>
      </div>

      {/* Hero with Single Search Box */}
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

            <ProfileCard profile={selectedProfile} />
          </div>
        )}
      </Hero>

      {/* Directory Section: All Attendees */}
      <section className="directory-section" id="attendees-directory">
        <div className="directory-container">
          <div className="directory-header">
            <span className="directory-tag">AHS COMMUNITY ROSTER</span>
            <h2 className="directory-title">Honor Roll &amp; Invitations</h2>
            <p className="directory-desc">
              Browse profiles for Freshers &amp; Farewell graduating seniors. Click any profile to view their personalized invitation card and QR code.
            </p>

            {/* Filter Tabs */}
            <div className="directory-tabs">
              <button
                type="button"
                className={`dir-tab ${activeTab === 'all' ? 'dir-tab--active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <Users size={16} />
                <span>All Attendees ({profiles.length})</span>
              </button>
              <button
                type="button"
                className={`dir-tab dir-tab--freshers ${activeTab === 'freshers' ? 'dir-tab--active' : ''}`}
                onClick={() => setActiveTab('freshers')}
              >
                <Sparkles size={16} />
                <span>Freshers ({freshersCount})</span>
              </button>
              <button
                type="button"
                className={`dir-tab dir-tab--farewell ${activeTab === 'farewell' ? 'dir-tab--active' : ''}`}
                onClick={() => setActiveTab('farewell')}
              >
                <GraduationCap size={16} />
                <span>Farewell Seniors ({farewellCount})</span>
              </button>
            </div>
          </div>

          {/* Grid of Profiles */}
          {filteredProfiles.length > 0 ? (
            <div className="directory-grid">
              {filteredProfiles.map(profile => {
                const isFreshers = profile.event === 'freshers';
                return (
                  <div
                    key={profile.id}
                    className={`dir-item ${isFreshers ? 'dir-item--freshers' : 'dir-item--farewell'}`}
                    onClick={() => handleProfileFound(profile)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleProfileFound(profile);
                    }}
                  >
                    <div className="dir-item__avatar">
                      {profile.photo ? (
                        <img
                          src={profile.photo}
                          alt={profile.name}
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="dir-item__initials">
                        {profile.name[0]}
                      </span>
                    </div>

                    <div className="dir-item__info">
                      <h4 className="dir-item__name">{profile.name}</h4>
                      <span className="dir-item__id">{!isFreshers ? 'AHS Graduating Senior' : ''}</span>
                    </div>

                    <span className={`dir-item__badge ${isFreshers ? 'badge-cyan' : 'badge-purple'}`}>
                      {isFreshers ? 'Freshers' : 'Farewell'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="directory-empty-card" style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              maxWidth: '540px',
              margin: '0 auto'
            }}>
              <Users size={36} className="text-cyan-400" style={{ opacity: 0.8, marginBottom: '0.75rem' }} />
              <h3 style={{ color: '#F1F5F9', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Roster Ready For Attendees</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                All previous sample data has been cleared. Use the Admin Portal to add attendees and upload photos.
              </p>
              <Link to="/admin" className="admin-portal-link">
                <Settings size={15} />
                <span>Go to Admin Portal</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Event Details Highlights */}
      <section className="event-info-section">
        <div className="event-info-container">
          <div className="event-card-row">
            <div className="event-info-card">
              <Calendar className="info-card-icon text-cyan-400" size={28} />
              <h3>Celebration Date</h3>
              <p className="highlight-text">{EVENT_DETAILS.year}</p>
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
              <p className="sub-text">Keynote, Tributes, Cultural &amp; Dinner</p>
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
