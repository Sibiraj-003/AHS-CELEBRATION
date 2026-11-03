import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Download, 
  Eye, 
  Music, 
  Mic, 
  Trophy, 
  Utensils, 
  PartyPopper, 
  Disc, 
  Flame, 
  X,
  Layers,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { PROGRAMME_SCHEDULE, SCHEDULE_METADATA, type ScheduleItem } from '../data/schedule';
import './ProgrammeSchedule.css';

interface ProgrammeScheduleProps {
  initialSession?: 'all' | 'morning' | 'afternoon';
  showPosterAction?: boolean;
}

export const ProgrammeSchedule: React.FC<ProgrammeScheduleProps> = ({
  initialSession = 'all',
  showPosterAction = true,
}) => {
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>(initialSession);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [completedItems, setCompletedItems] = useState<number[]>([]);

  const toggleCompleted = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredItems = useMemo(() => {
    return PROGRAMME_SCHEDULE.filter(item => {
      // Session filter
      if (sessionFilter !== 'all' && item.session !== sessionFilter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'dance' && item.category !== 'dance') return false;
        if (selectedCategory === 'speech' && item.category !== 'speech') return false;
        if (selectedCategory === 'games' && item.category !== 'games') return false;
        if (selectedCategory === 'ceremony' && item.category !== 'inaugural' && item.category !== 'farewell') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesPerformer = item.performer?.toLowerCase().includes(q);
        const matchesTag = item.tag?.toLowerCase().includes(q);
        const matchesId = item.id.toString() === q;
        return matchesTitle || matchesPerformer || matchesTag || matchesId;
      }
      return true;
    });
  }, [sessionFilter, selectedCategory, searchQuery]);

  // Split into left (1-15) and right (16-30) columns for desktop poster layout when in 'all' view
  const col1Items = useMemo(() => {
    if (sessionFilter === 'morning') return filteredItems;
    if (sessionFilter === 'afternoon') return [];
    return filteredItems.filter(item => item.id <= 15);
  }, [filteredItems, sessionFilter]);

  const col2Items = useMemo(() => {
    if (sessionFilter === 'afternoon') return filteredItems;
    if (sessionFilter === 'morning') return [];
    return filteredItems.filter(item => item.id > 15);
  }, [filteredItems, sessionFilter]);

  const getCategoryIcon = (category: ScheduleItem['category']) => {
    switch (category) {
      case 'dance':
        return <Flame size={13} className="cat-icon text-amber-400" />;
      case 'music':
        return <Music size={13} className="cat-icon text-pink-400" />;
      case 'speech':
        return <Mic size={13} className="cat-icon text-cyan-400" />;
      case 'games':
        return <Trophy size={13} className="cat-icon text-yellow-400" />;
      case 'break':
        return <Utensils size={13} className="cat-icon text-emerald-400" />;
      case 'celebration':
        return <Disc size={13} className="cat-icon text-purple-400" />;
      default:
        return <Sparkles size={13} className="cat-icon text-red-400" />;
    }
  };

  const renderScheduleCard = (item: ScheduleItem) => {
    const isCompleted = completedItems.includes(item.id);
    return (
      <div 
        key={item.id} 
        className={`schedule-pill-item ${isCompleted ? 'item-checked' : ''}`}
        title={`${item.id}. ${item.title}${item.performer ? ` (${item.performer})` : ''}`}
      >
        <div className="pill-number-badge">
          <span>{item.id}</span>
        </div>

        <div className="pill-content">
          <div className="pill-title-row">
            <span className="pill-title">{item.title}</span>
            {item.performer && (
              <span className="pill-performer">({item.performer})</span>
            )}
          </div>
          {item.tag && (
            <span className="pill-tag-hint">{item.tag}</span>
          )}
        </div>

        <div className="pill-action-area">
          <span className="pill-category-icon" title={item.category}>
            {getCategoryIcon(item.category)}
          </span>
          <button
            type="button"
            className={`pill-check-btn ${isCompleted ? 'active' : ''}`}
            onClick={(e) => toggleCompleted(item.id, e)}
            aria-label={`Mark event ${item.id} completed`}
            title={isCompleted ? 'Mark as upcoming' : 'Mark as done'}
          >
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="programme-schedule-section" id="schedule">
      <div className="programme-schedule-container">
        {/* Poster Style Frame Container */}
        <div className="schedule-poster-card">
          {/* Top Silk Red Glow Curtain Effect Background */}
          <div className="curtain-glow-top" />
          <div className="curtain-glow-bottom" />

          {/* Header Section styled after the official poster */}
          <header className="schedule-header">
            <div className="schedule-institution">
              <span className="inst-college">{SCHEDULE_METADATA.institution}</span>
              <span className="inst-department">{SCHEDULE_METADATA.department}</span>
            </div>

            <div className="schedule-ornament-divider">
              <span className="divider-line" />
              <span className="divider-gem">◆</span>
              <span className="divider-line" />
            </div>

            <h2 className="schedule-gold-title">
              FRESHERS DAY &amp; FAREWELL DAY
            </h2>

            <div className="schedule-pill-badge-wrap">
              <span className="badge-flourish left" />
              <div className="schedule-programme-pill">
                <span>{SCHEDULE_METADATA.scheduleTitle}</span>
              </div>
              <span className="badge-flourish right" />
            </div>
          </header>

          {/* Interactive Controls & Filters */}
          <div className="schedule-controls-bar">
            {/* Session Tabs */}
            <div className="session-tab-group">
              <button
                type="button"
                className={`session-tab-btn ${sessionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSessionFilter('all')}
              >
                <Layers size={14} />
                <span>All Events ({SCHEDULE_METADATA.totalEvents})</span>
              </button>
              <button
                type="button"
                className={`session-tab-btn ${sessionFilter === 'morning' ? 'active' : ''}`}
                onClick={() => setSessionFilter('morning')}
              >
                <Coffee size={14} />
                <span>Morning Session (1 - 15)</span>
              </button>
              <button
                type="button"
                className={`session-tab-btn ${sessionFilter === 'afternoon' ? 'active' : ''}`}
                onClick={() => setSessionFilter('afternoon')}
              >
                <PartyPopper size={14} />
                <span>Afternoon Session (16 - 30)</span>
              </button>
            </div>

            {/* Actions: Search & View Official Poster */}
            <div className="schedule-actions-row">
              <div className="schedule-search-input-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search item, dance, speaker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="schedule-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="search-clear-btn" 
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {showPosterAction && (
                <div className="poster-action-buttons">
                  <button
                    type="button"
                    className="btn-view-poster"
                    onClick={() => setShowPosterModal(true)}
                  >
                    <Eye size={15} />
                    <span>View Official Poster</span>
                  </button>

                  <a
                    href={SCHEDULE_METADATA.imagePath}
                    download="AHS_Celebration_Programme_Schedule_2026.jpg"
                    className="btn-download-poster"
                    title="Download Official Poster JPG"
                  >
                    <Download size={15} />
                    <span>Save</span>
                  </a>
                </div>
              )}
            </div>

            {/* Quick Category Filters */}
            <div className="category-filter-pills">
              <span className="cat-filter-label">Filter:</span>
              <button
                type="button"
                className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`cat-pill ${selectedCategory === 'dance' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('dance')}
              >
                <Flame size={12} /> Dance
              </button>
              <button
                type="button"
                className={`cat-pill ${selectedCategory === 'speech' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('speech')}
              >
                <Mic size={12} /> Speeches
              </button>
              <button
                type="button"
                className={`cat-pill ${selectedCategory === 'games' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('games')}
              >
                <Trophy size={12} /> Games
              </button>
              <button
                type="button"
                className={`cat-pill ${selectedCategory === 'ceremony' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ceremony')}
              >
                <Sparkles size={12} /> Ceremonies
              </button>
            </div>
          </div>

          {/* Schedule Grid Area */}
          <div className="schedule-content-area">
            {filteredItems.length === 0 ? (
              <div className="schedule-empty-state">
                <Search size={32} className="empty-icon" />
                <p>No programme events match "{searchQuery}"</p>
                <button
                  type="button"
                  className="btn-reset-search"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSessionFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : sessionFilter === 'all' ? (
              /* Dual Column layout matching the original poster (1-15 & 16-30) */
              <div className="schedule-dual-columns">
                {/* Column 1: Items 1 - 15 */}
                <div className="schedule-column">
                  <div className="column-session-header">
                    <span className="col-badge">SESSION 1</span>
                    <h3 className="col-title">Morning Events &amp; Welcome (1 - 15)</h3>
                  </div>
                  <div className="column-items-list">
                    {col1Items.map(renderScheduleCard)}
                  </div>
                </div>

                {/* Column 2: Items 16 - 30 */}
                <div className="schedule-column">
                  <div className="column-session-header">
                    <span className="col-badge badge-afternoon">SESSION 2</span>
                    <h3 className="col-title">Farewell, Shows &amp; DJ (16 - 30)</h3>
                  </div>
                  <div className="column-items-list">
                    {col2Items.map(renderScheduleCard)}
                  </div>
                </div>
              </div>
            ) : (
              /* Single column view for filtered session */
              <div className="schedule-single-column">
                <div className="column-items-list">
                  {filteredItems.map(renderScheduleCard)}
                </div>
              </div>
            )}
          </div>

          {/* Footer Motto styled after the original poster */}
          <footer className="schedule-poster-footer">
            <div className="footer-star-divider">
              <span className="star-line" />
              <span className="star-icon">★</span>
              <span className="star-line" />
            </div>
            <p className="schedule-motto">{SCHEDULE_METADATA.tagline}</p>
          </footer>
        </div>
      </div>

      {/* Official Poster Lightbox Modal */}
      {showPosterModal && (
        <div className="poster-modal-overlay" onClick={() => setShowPosterModal(false)}>
          <div className="poster-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="poster-modal-header">
              <h3>Official Programme Schedule Poster</h3>
              <div className="modal-header-actions">
                <a
                  href={SCHEDULE_METADATA.imagePath}
                  download="AHS_Celebration_Programme_Schedule_2026.jpg"
                  className="modal-download-btn"
                >
                  <Download size={16} />
                  <span>Download Original</span>
                </a>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowPosterModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="poster-modal-body">
              <img
                src={SCHEDULE_METADATA.imagePath}
                alt="AHS Freshers & Farewell Day Programme Schedule"
                className="poster-modal-image"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProgrammeSchedule;
