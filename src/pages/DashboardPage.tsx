import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { MeetingCard } from '../components/MeetingCard';
import { Search, Filter, Calendar, Users, CheckCircle, Video } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { meetings, setIsSimulateModalOpen } = useMeeting();
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(meetings.flatMap((m) => m.tags)));

  // Calculate high-level stats
  const totalDurationMinutes = Math.round(
    meetings.reduce((acc, m) => acc + m.durationSeconds, 0) / 60
  );
  const totalActionItems = meetings.reduce((acc, m) => acc + m.actionItems.length, 0);

  const filteredMeetings = meetings.filter((m) => {
    if (selectedTag && !m.tags.includes(selectedTag)) {
      return false;
    }
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q) ||
      m.participants.some((p) => p.name.toLowerCase().includes(q))
    );
  });

  return (
    <main className="dashboard-content">
      {/* Hero Header & Stats */}
      <div className="dashboard-hero">
        <div className="dashboard-title-area">
          <h1>My Meetings & Intelligence</h1>
          <p>
            Verifiable notes, transcripts, and action items from your conversations.
          </p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-pill">
            <span className="stat-value">{meetings.length}</span>
            <span className="stat-label">Total Calls</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value">{totalDurationMinutes}m</span>
            <span className="stat-label">Audio Captured</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value" style={{ color: 'var(--accent-success)' }}>
              {totalActionItems}
            </span>
            <span className="stat-label">Tracked Actions</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search-box">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Filter by title, overview, attendee..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <button
            className={`filter-chip ${selectedTag === null ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            All Meetings
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`filter-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="meetings-grid">
        {filteredMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginTop: '20px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            No meetings found matching your search.
          </p>
          <button className="btn-secondary" onClick={() => { setFilterSearch(''); setSelectedTag(null); }}>
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
};
