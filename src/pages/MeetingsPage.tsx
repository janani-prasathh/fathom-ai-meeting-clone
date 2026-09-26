import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Meeting } from '../types';
import { api } from '../api/client';
import { MeetingsSkeleton } from '../components/SkeletonLoaders';
import {
  Video,
  Layers,
  Search,
  Calendar,
  Clock,
  CheckSquare,
  Compass,
  HelpCircle,
  UserCheck,
  ArrowRight,
  Loader2,
  Filter,
  Upload
} from 'lucide-react';

interface MeetingsPageProps {
  initialScope?: 'my' | 'all';
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({ initialScope }) => {
  const {
    meetings,
    userMeetings,
    isLoadingUserMeetings,
    currentUser,
    setActiveMeetingId,
    activeView,
    setActiveView,
    setIsImportModalOpen
  } = useMeeting();

  // If activeView is 'my-meetings', default to 'my'; if 'meetings', default to 'all'
  const defaultScope = initialScope || (activeView === 'my-meetings' ? 'my' : 'all');
  const [scope, setScope] = useState<'my' | 'all'>(defaultScope);
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Keep scope in sync if sidebar clicked My Meetings vs All Meetings
  useEffect(() => {
    if (activeView === 'my-meetings') {
      setScope('my');
    } else if (activeView === 'meetings') {
      setScope('all');
    }
  }, [activeView]);

  const activeDataset: Meeting[] = scope === 'my' ? userMeetings : meetings;

  // Extract tags from active dataset
  const allTags = Array.from(new Set(activeDataset.flatMap((m) => m.tags || [])));

  const filteredMeetings = activeDataset.filter((m) => {
    if (selectedTag && !(m.tags || []).includes(selectedTag)) {
      return false;
    }
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.overview || '').toLowerCase().includes(q) ||
      (m.participants || []).some((p) => p.name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 36px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      {/* 1. Header & Scope Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px' }}>
              MEETING REPOSITORY
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
              {scope === 'my' ? 'My Meetings' : 'All Meetings'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
              {scope === 'my'
                ? `Meetings you attended, own actions in, or spoke at (${currentUser.name}).`
                : 'All team meetings, syncs, and recordings across the workspace.'}
            </p>
          </div>

          {/* Right Header Controls: Scope & Import Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                background: '#0f172a',
                border: '1px solid #1e283b',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px'
              }}
            >
              <button
                onClick={() => { setScope('my'); setActiveView('my-meetings'); }}
                style={{
                  background: scope === 'my' ? '#1e283b' : 'transparent',
                  color: scope === 'my' ? '#f1f5f9' : '#94a3b8',
                  border: scope === 'my' ? '1px solid #334155' : '1px solid transparent',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: scope === 'my' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                My Meetings ({userMeetings.length})
              </button>
              <button
                onClick={() => { setScope('all'); setActiveView('meetings'); }}
                style={{
                  background: scope === 'all' ? '#1e283b' : 'transparent',
                  color: scope === 'all' ? '#f1f5f9' : '#94a3b8',
                  border: scope === 'all' ? '1px solid #334155' : '1px solid transparent',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: scope === 'all' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Meetings ({meetings.length})
              </button>
            </div>

            <button
              onClick={() => setIsImportModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              title="Import or process a meeting recording"
            >
              <Upload size={13} />
              <span>Import Meeting</span>
            </button>
          </div>
        </div>

        {/* 2. Filter Search and Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '16px' }}>
          <div className="filter-search-box" style={{ maxWidth: '380px', flex: 1 }}>
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search meetings by title, attendee, topic..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              className={`filter-chip ${selectedTag === null ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All
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
      </div>

      {/* Loading state */}
      {isLoadingUserMeetings && activeDataset.length === 0 && (
        <MeetingsSkeleton />
      )}

      {/* Empty State */}
      {!isLoadingUserMeetings && filteredMeetings.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            marginTop: '16px'
          }}
        >
          <Video size={36} style={{ color: '#6366f1', margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '6px' }}>
            {filterSearch || selectedTag ? 'No results found.' : 'No meetings yet.'}
          </h3>
          <p style={{ color: '#8b949e', fontSize: '0.88rem' }}>
            {filterSearch || selectedTag
              ? 'Try searching for a meeting, decision, action, person, or spoken phrase.'
              : 'Connect your calendar or ingest your first meeting to start building your workspace.'}
          </p>
          {(filterSearch || selectedTag) && (
            <button
              className="btn-secondary"
              onClick={() => { setFilterSearch(''); setSelectedTag(null); }}
              style={{ marginTop: '14px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Meetings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {filteredMeetings.map((m) => {
          const mDate = new Date(m.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          const durationMin = Math.round((m.durationSeconds || 0) / 60);

          const decisionsCount = m.stats?.decisionsCount ?? (m.keyDecisions?.length || 0);
          const totalActions = m.stats?.totalActions ?? (m.actionItems?.length || 0);
          const myActionsCount = m.stats?.myActionsCount ?? (m.actionItems?.filter(a => a.assignee?.id === currentUser.id).length || 0);
          const questionsCount = m.stats?.questionsCount ?? (m.openQuestions?.length || 0);

          const isAttendee = m.involvement?.attended ?? (m.participants || []).some(p => p.id === currentUser.id);

          return (
            <div
              key={m.id}
              onClick={() => setActiveMeetingId(m.id)}
              style={{
                background: '#0f172a',
                border: '1px solid #1e283b',
                borderRadius: '6px',
                padding: '14px 18px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
              className="meeting-card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top line: Date · Duration · Involvement */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {mDate}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {durationMin} min
                    </span>

                    {isAttendee && (
                      <>
                        <span>·</span>
                        <span
                          style={{
                            background: 'rgba(37, 99, 235, 0.08)',
                            color: '#93c5fd',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 500
                          }}
                        >
                          Attended
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: '#f1f5f9',
                      margin: '0 0 4px 0',
                      lineHeight: 1.35
                    }}
                  >
                    {m.title}
                  </h3>

                  {/* Overview */}
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      margin: '0 0 10px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {m.overview}
                  </p>

                  {/* Bottom Metrics Bar: Decisions · My Actions / Total Actions · Open Questions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '0.76rem' }}>
                    {/* Decisions */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontWeight: 500 }}>
                      <Compass size={13} />
                      <span>{decisionsCount} Decision{decisionsCount !== 1 ? 's' : ''}</span>
                    </span>

                    <span>·</span>

                    {/* My Actions or Total Actions */}
                    {scope === 'my' || myActionsCount > 0 ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#34d399',
                          fontWeight: 600
                        }}
                      >
                        <CheckSquare size={13} />
                        <span>{myActionsCount} My Action{myActionsCount !== 1 ? 's' : ''}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#8b949e'
                        }}
                      >
                        <CheckSquare size={13} />
                        <span>{totalActions} Actions</span>
                      </span>
                    )}

                    <span>·</span>

                    {/* Open Questions */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontWeight: 500 }}>
                      <HelpCircle size={13} />
                      <span>{questionsCount} Open Question{questionsCount !== 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>

                {/* Right side: Participants stack & Arrow */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div className="avatar-stack">
                    {(m.participants || []).slice(0, 4).map((p) => (
                      <img
                        key={p.id}
                        src={p.avatar}
                        alt={p.name}
                        title={`${p.name} (${p.role})`}
                        style={{ width: 28, height: 28 }}
                      />
                    ))}
                    {(m.participants || []).length > 4 && (
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#21262d',
                          border: '2px solid #1c2128',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: '#8b949e',
                          marginLeft: '-6px'
                        }}
                      >
                        +{m.participants.length - 4}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontSize: '0.78rem', fontWeight: 500 }}>
                    <span>View evidence</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
