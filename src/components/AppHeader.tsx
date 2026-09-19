import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Search, Sparkles, PlusCircle, Video } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    activeMeetingId,
    setActiveMeetingId,
    setIsGlobalSearchOpen,
    setIsSimulateModalOpen,
    meetings
  } = useMeeting();

  return (
    <header className="top-nav glass">
      <div className="nav-brand" onClick={() => setActiveMeetingId(null)}>
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>
        <span className="brand-name">Fathom</span>
        <span className="brand-badge">Intelligence</span>
      </div>

      <div className="nav-center">
        <button
          className="global-search-trigger"
          onClick={() => setIsGlobalSearchOpen(true)}
          title="Search across all meetings (Cmd+K)"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} />
            <span>Search transcripts, action items, decisions...</span>
          </span>
          <kbd className="kbd-shortcut">⌘K</kbd>
        </button>
      </div>

      <div className="nav-actions">
        {activeMeetingId && (
          <button
            className="btn-secondary"
            onClick={() => setActiveMeetingId(null)}
          >
            All Meetings ({meetings.length})
          </button>
        )}
        <button
          className="btn-record-sim"
          onClick={() => setIsSimulateModalOpen(true)}
        >
          <Video size={16} />
          <span>Capture Meeting</span>
        </button>
      </div>
    </header>
  );
};
