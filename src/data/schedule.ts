export interface ScheduleItem {
  id: number;
  title: string;
  performer?: string;
  category: 'inaugural' | 'dance' | 'music' | 'speech' | 'games' | 'break' | 'farewell' | 'celebration';
  session: 'morning' | 'afternoon';
  tag?: string;
}

export const PROGRAMME_SCHEDULE: ScheduleItem[] = [
  // --- Column 1: Morning & Inaugural Session (1 - 15) ---
  {
    id: 1,
    title: 'Banner',
    category: 'inaugural',
    session: 'morning',
    tag: 'Opening Ceremony',
  },
  {
    id: 2,
    title: 'Tamil Thai Vazhthu',
    category: 'inaugural',
    session: 'morning',
    tag: 'Invocation Anthem',
  },
  {
    id: 3,
    title: 'Welcome Speech',
    performer: 'Sandhiya',
    category: 'speech',
    session: 'morning',
    tag: 'Inaugural Address',
  },
  {
    id: 4,
    title: 'Lighting the Lamp',
    category: 'inaugural',
    session: 'morning',
    tag: 'Traditional Kuthuvilakku',
  },
  {
    id: 5,
    title: "Freshers' Welcome",
    category: 'inaugural',
    session: 'morning',
    tag: 'Welcome Batch 2026',
  },
  {
    id: 6,
    title: 'Bharathanatyam',
    performer: 'Visalini',
    category: 'dance',
    session: 'morning',
    tag: 'Classical Solo Performance',
  },
  {
    id: 7,
    title: 'Principal Gift',
    category: 'speech',
    session: 'morning',
    tag: 'Honoring & Felicitations',
  },
  {
    id: 8,
    title: 'Vote of Thanks',
    performer: 'Ezhil Mam',
    category: 'speech',
    session: 'morning',
    tag: 'Formal Acknowledgement',
  },
  {
    id: 9,
    title: 'Break',
    category: 'break',
    session: 'morning',
    tag: 'Refreshment Break',
  },
  {
    id: 10,
    title: 'II Year Boys Dance',
    category: 'dance',
    session: 'morning',
    tag: 'Energetic Group Dance',
  },
  {
    id: 11,
    title: 'II Year Girls Dance',
    category: 'dance',
    session: 'morning',
    tag: 'Special Group Performance',
  },
  {
    id: 12,
    title: 'DMLT Final Year Dance',
    category: 'dance',
    session: 'morning',
    tag: 'Final Year Celebration',
  },
  {
    id: 13,
    title: "Freshers' Game",
    category: 'games',
    session: 'morning',
    tag: 'Fun & Interactive Games',
  },
  {
    id: 14,
    title: "Freshers' Gift",
    category: 'inaugural',
    session: 'morning',
    tag: 'Token of Love',
  },
  {
    id: 15,
    title: 'Lunch',
    category: 'break',
    session: 'morning',
    tag: 'Grand Feast & Networking',
  },

  // --- Column 2: Afternoon & Farewell Session (16 - 30) ---
  {
    id: 16,
    title: 'Farewell Welcome',
    category: 'farewell',
    session: 'afternoon',
    tag: 'Honoring Graduating Batch',
  },
  {
    id: 17,
    title: 'DMLT II Year Dance',
    category: 'dance',
    session: 'afternoon',
    tag: 'Department Performance',
  },
  {
    id: 18,
    title: 'III Year RIT Dance',
    category: 'dance',
    session: 'afternoon',
    tag: 'RIT Special Dance',
  },
  {
    id: 19,
    title: 'I Year Dance',
    category: 'dance',
    session: 'afternoon',
    tag: 'Freshers Stage Showcase',
  },
  {
    id: 20,
    title: "Freshers' Song",
    performer: 'Kabilesh',
    category: 'music',
    session: 'afternoon',
    tag: 'Live Musical Solo',
  },
  {
    id: 21,
    title: "Freshers' Boys Dance",
    category: 'dance',
    session: 'afternoon',
    tag: 'High Beat Group Dance',
  },
  {
    id: 22,
    title: 'Farewell Games',
    category: 'games',
    session: 'afternoon',
    tag: 'Memorable Senior Challenges',
  },
  {
    id: 23,
    title: 'Final Year Gift',
    category: 'farewell',
    session: 'afternoon',
    tag: 'Memento Presentation',
  },
  {
    id: 24,
    title: 'Freshers to Seniors',
    category: 'farewell',
    session: 'afternoon',
    tag: 'Tribute to Seniors',
  },
  {
    id: 25,
    title: 'Final Year Speech',
    category: 'speech',
    session: 'afternoon',
    tag: 'Nostalgic Recollections',
  },
  {
    id: 26,
    title: 'Photo Room Visit',
    category: 'celebration',
    session: 'afternoon',
    tag: 'Photobooth & Keepsake Memories',
  },
  {
    id: 27,
    title: 'PPT',
    category: 'celebration',
    session: 'afternoon',
    tag: 'Journey Down the Memory Lane',
  },
  {
    id: 28,
    title: 'Vote of Thanks',
    performer: 'Ezhil Mam',
    category: 'speech',
    session: 'afternoon',
    tag: 'Valedictory Remarks',
  },
  {
    id: 29,
    title: 'National Anthem',
    category: 'inaugural',
    session: 'afternoon',
    tag: 'Patriotic Conclusion',
  },
  {
    id: 30,
    title: 'DJ',
    category: 'celebration',
    session: 'afternoon',
    tag: 'Non-Stop Celebration Beats',
  },
];

export const SCHEDULE_METADATA = {
  institution: 'KRISHNA COLLEGE OF PARAMEDICAL SCIENCES',
  department: 'DEPARTMENT OF AHS',
  event: 'FRESHERS DAY & FAREWELL DAY',
  scheduleTitle: 'PROGRAMME SCHEDULE',
  tagline: 'CELEBRATING NEW BEGINNINGS & CHERISHED MEMORIES',
  imagePath: '/images/programme-schedule.jpg',
  totalEvents: 30,
};

