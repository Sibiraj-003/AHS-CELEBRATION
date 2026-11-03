import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import type { Profile } from '../data/profiles';
import { searchProfileAsync, fetchProfilesFromSupabase } from '../data/profiles';
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
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [error, setError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Background fetch all latest profiles from Supabase as soon as the search component mounts
  useEffect(() => {
    fetchProfilesFromSupabase();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setError(false);
      onSearchClear?.();
      return;
    }

    setIsSearching(true);
    setError(false);

    try {
      const result = await searchProfileAsync(query);
      if (result) {
        setError(false);
        onProfileFound(result);
      } else {
        setError(true);
        onSearchClear?.();
      }
    } catch {
      setError(true);
      onSearchClear?.();
    } finally {
      setIsSearching(false);
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
            placeholder="Enter your name (e.g. Kabeer, Sanjana, Sowndariya...)"
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
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>Find My Invitation</span>
              <ArrowRight size={16} className="submit-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="search-error-state" role="alert" id="search-error-message">
          <AlertCircle size={20} className="error-icon" />
          <div className="error-text-wrap">
            <h4 className="error-title">We couldn't find your invitation.</h4>
            <p className="error-subtext">Please check the spelling of your name or register number and try again.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;
