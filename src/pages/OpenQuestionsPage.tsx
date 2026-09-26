import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { QuestionsSkeleton } from '../components/SkeletonLoaders';
import { HelpCircle, Play, ArrowRight, Search, Loader2 } from 'lucide-react';

export const OpenQuestionsPage: React.FC = () => {
  const { navigateToMeeting, currentUser, openEvidenceExplorer } = useMeeting();
  const [scope, setScope] = useState<'relevant' | 'all'>('relevant');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const res = scope === 'relevant'
          ? await api.getUserQuestions(currentUser.id)
          : await api.getAllQuestions();

        if (isCurrent) setQuestions(res.openQuestions);
      } catch (err) {
        console.error('Failed to load open questions:', err);
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

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
    q.meetingTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (q.speakerName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      {/* Header & Scope Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fbbf24', marginBottom: '4px' }}>
              UNRESOLVED TOPICS & INQUIRIES
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-0.02em', margin: 0 }}>
              {scope === 'relevant' ? 'Questions Relevant to You' : 'All Open Questions'}
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.92rem', marginTop: '4px' }}>
              {scope === 'relevant'
                ? `Unresolved inquiries and blocked items surfaced during meetings you were part of (${currentUser.name}).`
                : 'All open questions and unresolved items logged across the workspace.'}
            </p>
          </div>

          {/* Scope Segment Control: [ Relevant to Me ] [ All Open Questions ] */}
          <div
            style={{
              display: 'inline-flex',
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '3px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => setScope('relevant')}
              style={{
                background: scope === 'relevant' ? '#1e293b' : 'transparent',
                color: scope === 'relevant' ? '#f8fafc' : '#94a3b8',
                border: scope === 'relevant' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: scope === 'relevant' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Relevant to Me
            </button>
            <button
              onClick={() => setScope('all')}
              style={{
                background: scope === 'all' ? '#1e293b' : 'transparent',
                color: scope === 'all' ? '#f8fafc' : '#94a3b8',
                border: scope === 'all' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: scope === 'all' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Open Questions
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginTop: '16px', maxWidth: '380px' }} className="filter-search-box">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search open questions..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <QuestionsSkeleton />
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
          <HelpCircle size={32} style={{ color: '#94a3b8', margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '6px', fontWeight: 600 }}>
            {searchFilter ? 'No results found.' : 'All questions resolved.'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {searchFilter
              ? 'Try searching for a meeting, decision, action, person, or spoken phrase.'
              : 'No open or blocked questions currently tracked.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((q) => (
            <div
              key={q.id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e283b',
                borderRadius: '6px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.45 }}>
                  "{q.question}"
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {q.speakerName && <span>Raised by <strong style={{ color: '#cbd5e1' }}>{q.speakerName}</strong> · </span>}
                  <span>{q.meetingTitle}</span>
                  {q.timestamp !== undefined && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{formatTime(q.timestamp)}</span>
                    </>
                  )}
                  {q.confidence !== undefined && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEvidenceExplorer({
                          id: q.id,
                          type: 'question',
                          title: q.question,
                          meetingId: q.meetingId,
                          meetingTitle: q.meetingTitle,
                          speakerName: q.speakerName,
                          timestamp: q.timestamp,
                          sourceQuote: q.question,
                          confidence: q.confidence
                        });
                      }}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#94a3b8',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        padding: '1px 7px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Inspect in Evidence Explorer"
                    >
                      ✓ Grounded
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  navigateToMeeting(
                    q.meetingId,
                    q.timestamp !== undefined ? 'transcript' : 'summary',
                    q.timestamp
                  )
                }
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <Play size={10} />
                <span>Jump to context</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
