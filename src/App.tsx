import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EventBackground from './components/EventBackground';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SchedulePage from './pages/SchedulePage';
import { fetchProfilesFromSupabase } from './data/profiles';
import './App.css';

export const App: React.FC = () => {
  useEffect(() => {
    // Proactively fetch all attendee profiles from Supabase so every user has instant access
    fetchProfilesFromSupabase();

    // Disable text/image copy, cut, and right-click context menu globally
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* React Bits Aurora Background Layers */}
        <EventBackground />

        {/* Foreground Content */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/profile/:profileId" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
