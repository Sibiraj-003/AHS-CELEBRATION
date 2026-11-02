import React, { useState } from 'react';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import type { Profile } from '../data/profiles';
import { findProfileByName, useProfiles } from '../data/profiles';
import './ProfileSearch.css';

interface ProfileSearchProps {
  onProfileFound: (profile: Profile) => void;
  onSearchClear?: () => void;
  initialQuery?: string;
}

export const ProfileSearch: React.FC<ProfileSearchProps> = ({
  onProfileFound,
  onSearchClear,
  initialQuery = ''
}) => {
  const [profiles] = useProfiles();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [error, setError] = useState(false);

  const sampleProfiles = profiles.slice(0, 4);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setError(false);
      onSearchClear?.();
      return;
    }

    const result = findProfileByName(query);

    if (result) {
      setError(false);
      onProfileFound(result);
    } else {
      setError(true);
      onSearchClear?.();
    }
  };

  const handleQuickSelect = (name: string) => {
    setSearchTerm(name);
    const result = findProfileByName(name);
    if (result) {
      setError(false);
      onProfileFound(result);
    }
  };

  return (
    <div className="search-container" id="invitation-search-section">
      <div className="search-header">
        <h2 className="search-title">Find Your Invitation</h2>
        <p className="search-subtitle">
          Enter your name below to access your personalized pass &amp; schedule
        </p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Enter your name"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (error) setError(false);
            }}
            id="attendee-name-input"
            autoComplete="off"
            spellCheck="false"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchTerm('');
                setError(false);
                onSearchClear?.();
              }}
              title="Clear input"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="search-submit-btn"
          id="find-my-invitation-btn"
        >
          <span>Find My Invitation</span>
          <ArrowRight size={16} className="submit-arrow" />
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="search-error-state" role="alert" id="search-error-message">
          <AlertCircle size={20} className="error-icon" />
          <div className="error-text-wrap">
            <h4 className="error-title">We couldn't find your invitation.</h4>
            <p className="error-subtext">Please check the name and try again.</p>
          </div>
        </div>
      )}

      {/* Suggested Quick Names */}
      {sampleProfiles.length > 0 && (
        <div className="search-quick-tags">
          <span className="quick-label">Try searching:</span>
          <div className="quick-chips">
            {sampleProfiles.map(p => (
              <button
                key={p.id}
                type="button"
                className={`chip ${p.event === 'freshers' ? 'chip--freshers' : 'chip--farewell'}`}
                onClick={() => handleQuickSelect(p.name)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;
