import { useState, useEffect } from 'react';

export interface Profile {
  id: string;
  name: string;
  regNo: string;
  eventType: "freshers" | "farewell";
  event?: "freshers" | "farewell"; // backward compatibility alias
  photo?: string;
  qrCode?: string;
  role?: string;
  quote?: string;
}

export const EVENT_DETAILS = {
  college: "KRISHNA COLLEGE OF PARAMEDICAL AND ALLIED HEALTH SCIENCE",
  department: "DEPARTMENT OF AHS",
  eventName: "AHS CELEBRATION 2026",
  mainEvent: "FRESHERS DAY & FAREWELL DAY",
  tagline: "Celebrating New Beginnings • Cherishing Memories",
  year: "2026",
  venue: "Main Auditorium, Krishna Health Campus",
  time: "09:30 AM onwards",
};

export const STORAGE_KEY = 'ahs_profiles_data_2026_clean';

// Default Profiles list starts completely empty so admin can add custom attendees
export const DEFAULT_PROFILES: Profile[] = [];

export const PROFILES: Profile[] = DEFAULT_PROFILES;

/**
 * Loads profiles from localStorage or returns defaults
 */
export function loadStoredProfiles(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    // Purge any legacy storage key with old mock attendees
    if (localStorage.getItem('ahs_profiles_data_2026')) {
      localStorage.removeItem('ahs_profiles_data_2026');
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p: any) => ({
        ...p,
        regNo: p.regNo || p.id,
        eventType: p.eventType || p.event || 'freshers',
        event: p.event || p.eventType || 'freshers',
        photo: p.photo || ''
      }));
    }
  } catch (err) {
    console.error('Error loading profiles from localStorage:', err);
  }
  return [];
}

/**
 * Saves profiles to localStorage and notifies subscribers
 */
export function saveStoredProfiles(profiles: Profile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new Event('ahs_profiles_updated'));
  } catch (err) {
    console.error('Error saving profiles to localStorage:', err);
  }
}

/**
 * Adds a new profile
 */
export function addStoredProfile(profile: Profile): Profile[] {
  const current = loadStoredProfiles();
  const exists = current.some(p => p.id === profile.id);
  const updated = exists
    ? current.map(p => (p.id === profile.id ? profile : p))
    : [profile, ...current];
  saveStoredProfiles(updated);
  return updated;
}

/**
 * Updates an existing profile
 */
export function updateStoredProfile(id: string, updates: Partial<Profile>): Profile[] {
  const current = loadStoredProfiles();
  const updated = current.map(p => (p.id === id ? { ...p, ...updates } : p));
  saveStoredProfiles(updated);
  return updated;
}

/**
 * Deletes a profile
 */
export function deleteStoredProfile(id: string): Profile[] {
  const current = loadStoredProfiles();
  const updated = current.filter(p => p.id !== id);
  saveStoredProfiles(updated);
  return updated;
}

/**
 * Resets profiles to original defaults
 */
export function resetStoredProfiles(): Profile[] {
  saveStoredProfiles([]);
  return [];
}

/**
 * Clears all profiles from storage completely
 */
export function clearAllStoredProfiles(): Profile[] {
  saveStoredProfiles([]);
  return [];
}

/**
 * React hook to listen for profile changes reactively
 */
export function useProfiles(): [Profile[], (profiles: Profile[]) => void] {
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredProfiles());

  useEffect(() => {
    const handleUpdate = () => {
      setProfiles(loadStoredProfiles());
    };

    window.addEventListener('ahs_profiles_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ahs_profiles_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateAll = (newProfiles: Profile[]) => {
    saveStoredProfiles(newProfiles);
    setProfiles(newProfiles);
  };

  return [profiles, updateAll];
}

/**
 * Normalizes user input for robust matching
 */
export function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[_\W]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds a profile by searching name or register number
 */
export function findProfileByName(query: string, profilesList?: Profile[]): Profile | undefined {
  const list = profilesList || loadStoredProfiles();
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery) return undefined;

  // 1. Exact normalized match against name or id
  const exact = list.find(p => {
    const normName = normalizeString(p.name);
    const normId = normalizeString(p.id);
    return normName === normalizedQuery || normId === normalizedQuery;
  });
  if (exact) return exact;

  // 2. Starts with query (e.g. "Harini" matching "Harini Varsha")
  const startsWith = list.find(p => {
    const normName = normalizeString(p.name);
    return normName.startsWith(normalizedQuery) || normalizedQuery.startsWith(normName);
  });
  if (startsWith) return startsWith;

  // 3. Includes word match
  return list.find(p => {
    const normName = normalizeString(p.name);
    return normName.includes(normalizedQuery);
  });
}

/**
 * Finds a profile by ID, RegNo, or URL slug
 */
export function findProfileById(id: string, profilesList?: Profile[]): Profile | undefined {
  const list = profilesList || loadStoredProfiles();
  if (!id) return undefined;
  const normalizedId = normalizeString(id);
  const cleanId = id.trim().toUpperCase().replace(/[-\s]/g, "_");
  const slugId = id.trim().toLowerCase().replace(/[\s_]+/g, "-");

  return list.find(p => {
    const pId = p.id ? normalizeString(p.id) : '';
    const pReg = p.regNo ? normalizeString(p.regNo) : '';
    const pName = p.name ? normalizeString(p.name) : '';
    const pSlug = p.id ? p.id.toLowerCase().replace(/[\s_]+/g, '-') : '';

    return (
      p.id === id ||
      p.id.toLowerCase() === id.toLowerCase() ||
      p.id === cleanId ||
      p.regNo === id ||
      p.regNo.toLowerCase() === id.toLowerCase() ||
      p.regNo === cleanId ||
      pSlug === slugId ||
      pId === normalizedId ||
      pReg === normalizedId ||
      pName === normalizedId
    );
  });
}
