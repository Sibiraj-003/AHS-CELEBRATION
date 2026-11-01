import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EventBackground from './components/EventBackground';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* React Bits Aurora Background Layers */}
        <EventBackground />

        {/* Foreground Content */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
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
