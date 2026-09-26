import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { DecisionsSkeleton } from '../components/SkeletonLoaders';
import { Compass, Clock, Play, ArrowRight, Calendar, Search, Loader2 } from 'lucide-react';

export const DecisionsPage: React.FC = () => {
  const { navigateToMeeting, currentUser, openEvidenceExplorer } = useMeeting();
  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const res = scope === 'my'
          ? await api.getUserDecisions(currentUser.id)
          : await api.getAllDecisions();

        if (isCurrent) setDecisions(res.decisions);
      } catch (err) {
        console.error('Failed to load decisions:', err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [scope, currentUser.id]);

  const formatTime = (secs?: number) => {
    if (secs === undefined || secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filtered = decisions.filter((d) =>
    d.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.meetingTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 36px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      {/* Header & Scope Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px' }}>
              TEAM AGREEMENTS & RESOLUTIONS
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
              {scope === 'my' ? 'My Decisions' : 'All Workspace Decisions'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
              {scope === 'my'
                ? `Key decisions agreed in meetings you participated in (${currentUser.name}).`
                : 'All key decisions and team agreements logged across organization syncs.'}
            </p>
          </div>

          {/* Scope Segment Control: [ My Decisions ] [ All Decisions ] */}
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
              onClick={() => setScope('my')}
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
              My Decisions
            </button>
            <button
              onClick={() => setScope('all')}
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
              All Decisions
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginTop: '16px', maxWidth: '380px' }} className="filter-search-box">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search decisions or originating meeting..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <DecisionsSkeleton />
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#0f172a',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            marginTop: '10px'
          }}
        >
          <Compass size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '4px' }}>
            {searchFilter ? 'No results found.' : 'No decisions recorded.'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.84rem' }}>
            {searchFilter
              ? 'Try searching for a meeting, decision, action, person, or spoken phrase.'
              : 'Key agreements surfaced from your team syncs will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map((d) => (
            <div
              key={d.id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e283b',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.45 }}>
                  {d.text}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>{d.meetingTitle}</span>
                  {d.timestamp !== undefined && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#38bdf8' }}>{formatTime(d.timestamp)}</span>
                    </>
                  )}
                  {d.confidence !== undefined && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEvidenceExplorer({
                          id: d.id,
                          type: 'decision',
                          title: d.text,
                          meetingId: d.meetingId,
                          meetingTitle: d.meetingTitle,
                          timestamp: d.timestamp,
                          sourceQuote: d.text,
                          confidence: d.confidence
                        });
                      }}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        padding: '1px 7px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Inspect in Evidence Explorer"
                    >
                      Grounded
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  navigateToMeeting(
                    d.meetingId,
                    d.timestamp !== undefined ? 'transcript' : 'summary',
                    d.timestamp
                  )
                }
                style={{
                  background: '#1e283b',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0
                }}
              >
                <Clock size={11} />
                <span>Evidence</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
