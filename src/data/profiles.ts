import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  date: "Nov 5, 2026",
  venue: "Near Boys Hostel",
  time: "10:00 AM",
};

export const STORAGE_KEY = 'ahs_profiles_data_2026_clean';

export const ATTENDEE_CLOUD_PHOTOS: Record<string, string> = {
  'sowndariya': '/photos/sowndariya.jpg',
  'soundariya': '/photos/sowndariya.jpg',
  'img-20261101-wa0013': '/photos/sowndariya.jpg',
};

// Map Supabase row to Profile
export function mapRowToProfile(row: any): Profile {
  const cleanId = (row.id || '').trim().toLowerCase();
  const photo = row.photo || ATTENDEE_CLOUD_PHOTOS[cleanId] || '';
  return {
    id: row.id,
    name: row.name,
    regNo: row.reg_no || row.id,
    eventType: (row.event_type || 'freshers') as 'freshers' | 'farewell',
    event: (row.event_type || 'freshers') as 'freshers' | 'farewell',
    photo,
    role: row.role || '',
    quote: row.quote || '',
  };
}

// Fetch all profiles from Supabase (with fallback to local storage & defaults)
export async function fetchProfilesFromSupabase(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const list = data.map(mapRowToProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event('ahs_profiles_updated'));
      }
      return list;
    }
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to stored/default profiles:', err);
  }

  // REST API fallback if client SDK fails
  try {
    const supabaseUrl = 'https://fkunjtrdccsuslaefdch.supabase.co';
    const anonKey = 'sb_publishable_w6JySw5FJpVUaoYsmYrOPw__gSWywyo';
    const restRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    if (restRes.ok) {
      const rows = await restRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const list = rows.map(mapRowToProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new Event('ahs_profiles_updated'));
        }
        return list;
      }
    }
  } catch (restErr) {
    console.warn('REST fallback fetch failed:', restErr);
  }

  return loadStoredProfiles();
}

// Fetch single profile by ID from Supabase
export async function fetchProfileByIdFromSupabase(id: string): Promise<Profile | undefined> {
  const cleanId = (id || '').trim().toLowerCase();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.ilike.${cleanId},reg_no.ilike.${cleanId}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const p = mapRowToProfile(data);
      addStoredProfile(p);
      return p;
    }
  } catch (err) {
    console.warn('Supabase fetchProfileById failed:', err);
  }

  // REST fallback
  try {
    const supabaseUrl = 'https://fkunjtrdccsuslaefdch.supabase.co';
    const anonKey = 'sb_publishable_w6JySw5FJpVUaoYsmYrOPw__gSWywyo';
    const restRes = await fetch(`${supabaseUrl}/rest/v1/profiles?or=(id.ilike.${cleanId},reg_no.ilike.${cleanId})&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    if (restRes.ok) {
      const rows = await restRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const p = mapRowToProfile(rows[0]);
        addStoredProfile(p);
        return p;
      }
    }
  } catch (restErr) {
    console.warn('REST fallback failed:', restErr);
  }

  return findProfileById(id);
}

// Upsert profile into Supabase
export async function upsertProfileToSupabase(profile: Profile): Promise<boolean> {
  addStoredProfile(profile);
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      reg_no: profile.regNo || profile.id,
      event_type: profile.eventType || profile.event || 'freshers',
      photo: profile.photo || '',
      role: profile.role || '',
      quote: profile.quote || '',
    });
    if (error) {
      console.warn('Supabase upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert exception:', err);
    return false;
  }
}

// Delete profile from Supabase
export async function deleteProfileFromSupabase(id: string): Promise<boolean> {
  deleteStoredProfile(id);
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// Upload photo directly to Supabase storage bucket 'photos'
export async function uploadPhotoToSupabase(file: File, id: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${id}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('photos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) {
      console.warn('Supabase storage upload error:', error);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Supabase storage upload exception:', err);
    return null;
  }
}

// Pre-populated official attendees so any user/student immediately finds their invitation even on first load without admin login
export const DEFAULT_PROFILES: Profile[] = [
  {
    id: "kabeer-khan",
    name: "Kabeer khan",
    regNo: "KABEER_KHAN 013",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/kabeer-khan-1793556484339.jpg",
    role: "RIT Batch 2026",
    quote: ""
  },
  {
    id: "sanjana",
    name: "Sanjana",
    regNo: "SANJANA 007",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/sanjana-1793557830420.jpg",
    role: "RIT Graduating Senior",
    quote: ""
  },
  {
    id: "muneeshwaran",
    name: "Muneeshwaran",
    regNo: "MUNEESHWARAN 014",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/muneeshwaran-1793556553459.jpg",
    role: "DMLT Batch 2026",
    quote: ""
  },
  {
    id: "sowndariya",
    name: "Sowndariya",
    regNo: "SOWNDARIYA 001",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/sowndariya.jpg",
    role: "DMLT Batch 2026",
    quote: ""
  },
  {
    id: "lakshmi",
    name: "Lakshmi",
    regNo: "LAKSHMI 002",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/lakshmi-1793543218177.jpg",
    role: "OPTOM Batch 2026",
    quote: ""
  },
  {
    id: "elakiya",
    name: "Elakiya",
    regNo: "ELAKIYA 001",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/elakiya-1793556943593.jpg",
    role: "DMLT Graduating Senior",
    quote: ""
  },
  {
    id: "palaniyammal",
    name: "Palaniyammal",
    regNo: "PALANIYAMMAL 002",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/palaniyammal-1793603613781.jpg",
    role: "DMLT Graduating Senior",
    quote: ""
  },
  {
    id: "roshini",
    name: "Roshini",
    regNo: "ROSHINI 003",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/roshini-1793603528959.jpg",
    role: "DMLT Graduating Senior",
    quote: ""
  },
  {
    id: "raman",
    name: "Raman",
    regNo: "RAMAN 004",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/raman-1793603494839.jpg",
    role: "DMLT Graduating Senior",
    quote: ""
  },
  {
    id: "bharakath-nisha",
    name: "Bharakath nisha",
    regNo: "BHARAKATH_NISHA 005",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/bharakath-nisha-1793603474801.jpg",
    role: "RIT Graduating Senior",
    quote: ""
  },
  {
    id: "harini-varsha",
    name: "Harini varsha",
    regNo: "HARINI_VARSHA 003",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/harini-varsha-1793555234256.jpg",
    role: "OPTOM Batch 2026",
    quote: ""
  },
  {
    id: "jayasri",
    name: "Jayasri",
    regNo: "JAYASRI 006",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/jayasri-1793557504911.jpg",
    role: "RIT Graduating Senior",
    quote: ""
  },
  {
    id: "deepika",
    name: "Deepika",
    regNo: "DEEPIKA 004",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/deepika-1793555411097.jpg",
    role: "OPTOM Batch 2026",
    quote: ""
  },
  {
    id: "vishal",
    name: "Vishal",
    regNo: "VISHAL 008",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/vishal-1793557674640.jpg",
    role: "RIT Graduating Senior",
    quote: ""
  },
  {
    id: "venkatesh",
    name: "Venkatesh",
    regNo: "VENKATESH 009",
    eventType: "farewell",
    event: "farewell",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/venkatesh-1793557758428.jpg",
    role: "RIT Graduating Senior",
    quote: ""
  },
  {
    id: "dayana",
    name: "Dayana",
    regNo: "DAYANA 005",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/dayana-1793555558392.jpg",
    role: "OPTOM Batch 2026",
    quote: ""
  },
  {
    id: "angel",
    name: "Angel",
    regNo: "ANGEL 006",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/angel-1793555789070.jpg",
    role: "OPTOM Batch 2026",
    quote: ""
  },
  {
    id: "lisha",
    name: "Lisha",
    regNo: "LISHA 007",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/lisha-1793555924455.jpg",
    role: "RIT Batch 2026",
    quote: ""
  },
  {
    id: "chinnaiya",
    name: "Chinnaiya",
    regNo: "CHINNAIYA 008",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/chinnaiya-1793556050928.jpg",
    role: "DMLT Batch 2026",
    quote: ""
  },
  {
    id: "kabilesh",
    name: "Kabilesh",
    regNo: "KABILESH 009",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/kabilesh-1793556172314.jpg",
    role: "RIT Batch 2026",
    quote: ""
  },
  {
    id: "kirthikraj",
    name: "Kirthikraj",
    regNo: "KIRTHIKRAJ 010",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/kirthikraj-1793556245608.jpg",
    role: "RIT Batch 2026",
    quote: ""
  },
  {
    id: "jeeva",
    name: "Jeeva",
    regNo: "JEEVA 011",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/jeeva-1793556305482.jpg",
    role: "RIT Batch 2026",
    quote: ""
  },
  {
    id: "santhru",
    name: "Santhru",
    regNo: "SANTHRU 012",
    eventType: "freshers",
    event: "freshers",
    photo: "https://fkunjtrdccsuslaefdch.supabase.co/storage/v1/object/public/photos/santhru-1793556384966.jpg",
    role: "RIT Batch 2026",
    quote: ""
  }
];

export const PROFILES: Profile[] = DEFAULT_PROFILES;

/**
 * Loads profiles from localStorage or returns pre-populated defaults
 */
export function loadStoredProfiles(): Profile[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;
  try {
    if (localStorage.getItem('ahs_profiles_data_2026')) {
      localStorage.removeItem('ahs_profiles_data_2026');
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((p: any) => ({
        ...p,
        regNo: p.regNo || p.id,
        eventType: p.eventType || p.event || 'freshers',
        event: p.event || p.eventType || 'freshers',
        photo: p.photo || ''
      }));
    }
    // If empty array was saved previously, return DEFAULT_PROFILES!
    return DEFAULT_PROFILES;
  } catch (err) {
    console.error('Error loading profiles from localStorage:', err);
  }
  return DEFAULT_PROFILES;
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
  saveStoredProfiles(DEFAULT_PROFILES);
  return DEFAULT_PROFILES;
}

/**
 * Clears all profiles from storage completely
 */
export function clearAllStoredProfiles(): Profile[] {
  saveStoredProfiles(DEFAULT_PROFILES);
  return DEFAULT_PROFILES;
}

/**
 * React hook to listen for profile changes reactively
 */
export function useProfiles(): [Profile[], (profiles: Profile[]) => void] {
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredProfiles());

  useEffect(() => {
    let mounted = true;
    fetchProfilesFromSupabase().then(list => {
      if (mounted && list && list.length > 0) {
        setProfiles(list);
      }
    });

    const handleUpdate = () => {
      setProfiles(loadStoredProfiles());
    };

    window.addEventListener('ahs_profiles_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      mounted = false;
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
 * Finds a profile by searching name or register number synchronously
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

  const found = list.find(p => {
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

  if (found) {
    if ((!found.photo || found.photo === '') && ATTENDEE_CLOUD_PHOTOS[slugId]) {
      found.photo = ATTENDEE_CLOUD_PHOTOS[slugId];
    }
    return found;
  }

  // Fallback to default pre-loaded profiles
  const def = DEFAULT_PROFILES.find(p => p.id.toLowerCase() === slugId);
  if (def) return def;

  if (ATTENDEE_CLOUD_PHOTOS[slugId]) {
    return {
      id: slugId,
      name: slugId.charAt(0).toUpperCase() + slugId.slice(1),
      regNo: slugId.toUpperCase(),
      eventType: 'freshers',
      event: 'freshers',
      photo: ATTENDEE_CLOUD_PHOTOS[slugId],
      role: 'AHS Batch 2026',
    };
  }

  return undefined;
}

/**
 * High-reliability async profile search:
 * 1. Checks local memory / cache instantly
 * 2. If not found locally, queries Supabase live in real-time
 */
export async function searchProfileAsync(query: string): Promise<Profile | undefined> {
  const clean = query.trim();
  if (!clean) return undefined;

  // 1. Instant local / memory lookup
  const localMatch = findProfileByName(clean) || findProfileById(clean);
  if (localMatch) return localMatch;

  // 2. Real-time Supabase query
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${clean}%,id.ilike.%${clean}%,reg_no.ilike.%${clean}%`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const p = mapRowToProfile(data);
      addStoredProfile(p);
      return p;
    }
  } catch (err) {
    console.warn('Supabase searchProfileAsync query failed, checking REST:', err);
  }

  // 3. REST fallback
  try {
    const supabaseUrl = 'https://fkunjtrdccsuslaefdch.supabase.co';
    const anonKey = 'sb_publishable_w6JySw5FJpVUaoYsmYrOPw__gSWywyo';
    const encoded = encodeURIComponent(`(name.ilike.*${clean}*,id.ilike.*${clean}*,reg_no.ilike.*${clean}*)`);
    const restRes = await fetch(`${supabaseUrl}/rest/v1/profiles?or=${encoded}&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    if (restRes.ok) {
      const rows = await restRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const p = mapRowToProfile(rows[0]);
        addStoredProfile(p);
        return p;
      }
    }
  } catch (restErr) {
    console.warn('REST search fallback failed:', restErr);
  }

  return undefined;
}
