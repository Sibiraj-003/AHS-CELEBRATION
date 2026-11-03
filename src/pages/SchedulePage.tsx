import React from 'react';
import { Link } from 'react-router-dom';
import ProgrammeSchedule from '../components/ProgrammeSchedule';
import { ArrowLeft, Sparkles, Home as HomeIcon } from 'lucide-react';
import { EVENT_DETAILS } from '../data/profiles';
import './SchedulePage.css';

export const SchedulePage: React.FC = () => {
  return (
    <div className="schedule-page-container">
      {/* Top Navbar */}
      <header className="schedule-page-nav">
        <Link to="/" className="schedule-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Event Home</span>
        </Link>

        <div className="schedule-nav-center">
          <Sparkles size={15} className="text-red-400" />
          <span className="schedule-nav-brand">{EVENT_DETAILS.eventName}</span>
        </div>

        <Link to="/" className="schedule-home-icon-btn" title="Home">
          <HomeIcon size={16} />
        </Link>
      </header>

      {/* Main Programme Schedule Component */}
      <main className="schedule-page-main">
        <ProgrammeSchedule />
      </main>

      {/* Footer */}
      <footer className="schedule-page-footer">
        <p>{EVENT_DETAILS.college}</p>
        <p className="footer-sub">{EVENT_DETAILS.department} • Official Programme Schedule 2026</p>
      </footer>
    </div>
  );
};

export default SchedulePage;

