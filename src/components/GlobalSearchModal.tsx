import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { SearchSkeleton } from './SkeletonLoaders';
import {
  Search,
  X,
  FileText,
  CheckSquare,
  HelpCircle,
  MessageSquare,
  Play,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  User,
  CornerDownLeft,
  Loader2
} from 'lucide-react';

interface FlattenedSearchItem {
  id: string;
  category: 'people' | 'meetings' | 'decisions' | 'actions' | 'questions' | 'evidence';
  title: string;
  subtitle: string;
  meetingId: string;
  timestamp?: number;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
  onSelect: () => void;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    navigateToMeeting,
    currentUser,
    setActiveView
  } = useMeeting();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    people: any[];
    meetings: any[];
    decisions: any[];
    actionItems: any[];
    openQuestions: any[];
    transcripts: any[];
    isUserScoped?: boolean;
  }>({
    people: [],
    meetings: [],
    decisions: [],
    actionItems: [],
    openQuestions: [],
    transcripts: []
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
      setSearchResults({
        people: [],
        meetings: [],
        decisions: [],
        actionItems: [],
        openQuestions: [],
        transcripts: []
      });
    }
  }, [isGlobalSearchOpen]);

  const q = query.trim();

  // Debounced search query against backend SQLite database
  useEffect(() => {
    if (!q) {
      setSearchResults({
        people: [],
        meetings: [],
        decisions: [],
        actionItems: [],
        openQuestions: [],
        transcripts: []
      });
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchMeetings(q, currentUser?.id);
        if (isCurrent) {
          setSearchResults({
            people: res.people || [],
            meetings: res.meetings || [],
            decisions: res.decisions || [],
            actionItems: res.actionItems || [],
            openQuestions: res.openQuestions || [],
            transcripts: res.transcripts || [],
            isUserScoped: res.isUserScoped
          });
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 120);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [q, currentUser?.id]);

  const formatTime = (secs?: number) => {
    if (secs === undefined || secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Build flattened categorized list for sequential arrow-key navigation
  const flattenedItems: FlattenedSearchItem[] = useMemo(() => {
    const items: FlattenedSearchItem[] = [];

    // 0. People (Workspace Members)
    (searchResults.people || []).forEach((p) => {
      items.push({
        id: `person-${p.id}`,
        category: 'people',
        title: p.name,
        subtitle: `${p.role} · ${p.email}`,
        meetingId: '',
        badge: 'Member',
        badgeColor: '#818cf8',
        avatar: p.avatar,
        onSelect: () => {
          setQuery(p.name);
        }
      });
    });

    // 1. Meetings
    searchResults.meetings.forEach((m) => {
      const durMin = Math.round((m.durationSeconds || 0) / 60);
      items.push({
        id: `meeting-${m.id}`,
        category: 'meetings',
        title: m.title,
        subtitle: `${formatDate(m.date)} · ${durMin} min`,
        meetingId: m.id,
        onSelect: () => {
          navigateToMeeting(m.id, 'summary');
          setIsGlobalSearchOpen(false);
        }
      });
    });

    // 2. Decisions
    searchResults.decisions.forEach((d) => {
      items.push({
        id: `decision-${d.id || d.text}`,
        category: 'decisions',
        title: d.text,
        subtitle: `${d.meetingTitle}${d.timestamp !== null && d.timestamp !== undefined ? ` · ${formatTime(d.timestamp)}` : ''}`,
        meetingId: d.meetingId,
        timestamp: d.timestamp,
        badge: 'Decision',
        badgeColor: '#38bdf8',
        onSelect: () => {
          navigateToMeeting(
            d.meetingId,
            d.timestamp !== null && d.timestamp !== undefined ? 'transcript' : 'summary',
            d.timestamp
          );
          setIsGlobalSearchOpen(false);
        }
      });
    });

    // 3. Action Items
    searchResults.actionItems.forEach((a) => {
      const isMine = a.assigneeId === currentUser?.id || a.assigneeName === currentUser?.name;
      items.push({
        id: `action-${a.id}`,
        category: 'actions',
        title: a.title,
        subtitle: `Assigned to ${a.assigneeName || 'Unassigned'}${a.timestamp ? ` · ${formatTime(a.timestamp)}` : ''}`,
        meetingId: a.meetingId,
        timestamp: a.timestamp,
        badge: a.completed ? 'Completed' : (isMine ? 'My Action' : 'Action'),
        badgeColor: a.completed ? '#34d399' : (isMine ? '#6366f1' : '#f59e0b'),
        onSelect: () => {
          navigateToMeeting(
            a.meetingId,
            a.timestamp !== undefined && a.timestamp !== null ? 'transcript' : 'actions',
            a.timestamp
          );
          setIsGlobalSearchOpen(false);
        }
      });
    });

    // 4. Open Questions
    searchResults.openQuestions.forEach((oq) => {
      items.push({
        id: `question-${oq.id}`,
        category: 'questions',
        title: oq.question,
        subtitle: `${oq.meetingTitle}${oq.speakerName ? ` · ${oq.speakerName}` : ''}${oq.timestamp ? ` · ${formatTime(oq.timestamp)}` : ''}`,
        meetingId: oq.meetingId,
        timestamp: oq.timestamp,
        badge: 'Open Question',
        badgeColor: '#fbbf24',
        onSelect: () => {
          navigateToMeeting(
            oq.meetingId,
            oq.timestamp !== undefined && oq.timestamp !== null ? 'transcript' : 'summary',
            oq.timestamp
          );
          setIsGlobalSearchOpen(false);
        }
      });
    });

    // 5. Spoken Evidence (Transcripts)
    searchResults.transcripts.forEach((t) => {
      items.push({
        id: `utterance-${t.id}`,
        category: 'evidence',
        title: `"${t.text}"`,
        subtitle: `${t.speakerName || 'Speaker'} · ${formatTime(t.timestamp)} · ${t.meetingTitle}`,
        meetingId: t.meetingId,
        timestamp: t.timestamp,
        badge: 'Evidence',
        badgeColor: '#a855f7',
        onSelect: () => {
          navigateToMeeting(t.meetingId, 'transcript', t.timestamp);
          setIsGlobalSearchOpen(false);
        }
      });
    });

    return items;
  }, [searchResults, currentUser, navigateToMeeting, setIsGlobalSearchOpen]);

  // Global & modal keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K opens or closes search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
        return;
      }

      if (!isGlobalSearchOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsGlobalSearchOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (flattenedItems.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (flattenedItems.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flattenedItems[selectedIndex]) {
          flattenedItems[selectedIndex].onSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen, flattenedItems, selectedIndex]);

  // Keep selected item scrolled into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // RULE: Hook declarations MUST stay before this guard!
  if (!isGlobalSearchOpen) return null;

  const quickQueries = [
    { label: 'My Actions', query: 'my actions' },
    { label: 'Pending Actions', query: 'pending actions' },
    { label: 'SQLite', query: 'SQLite' },
    { label: 'Sarah', query: 'Sarah' },
    { label: 'Benchmark', query: 'benchmark' },
    { label: 'Open Questions', query: 'open questions' }
  ];

  return (
    <div className="modal-backdrop" onClick={() => setIsGlobalSearchOpen(false)}>
      <div
        className="modal-card"
        style={{
          maxWidth: '680px',
          width: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '1px solid #1e283b',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid #1e283b',
            background: '#0f172a',
            gap: '12px'
          }}
        >
          <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Meetwise — meetings, decisions, actions, questions, evidence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.96rem',
              outline: 'none',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          />
          {isSearching && (
            <Loader2 size={16} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Clear search query"
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              color: '#94a3b8'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Chips (when search is empty) */}
        {!q && (
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e283b', background: '#0f172a' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Workspace Queries
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(item.query)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  <Search size={11} style={{ color: '#64748b' }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        <div
          ref={resultsContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* User-Scoped Notice */}
          {searchResults.isUserScoped && (
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <User size={14} style={{ color: '#6366f1' }} />
              <span>
                Displaying actions for logged-in user: <strong>{currentUser?.name || 'You'}</strong>
              </span>
            </div>
          )}

          {/* Categorized Display */}

          {/* 0. People */}
          {searchResults.people && searchResults.people.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#818cf8',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User size={13} />
                <span>People ({searchResults.people.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.people.map((p) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `person-${p.id}`);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={p.id}
                      data-selected={isSelected}
                      onClick={() => setQuery(p.name)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.14)' : '#1c2128',
                        border: isSelected ? '1px solid #6366f1' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img
                          src={p.avatar}
                          alt={p.name}
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '1px' }}>
                            {p.role} · <span style={{ color: '#818cf8' }}>{p.email}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#a5b4fc',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          flexShrink: 0
                        }}
                      >
                        Team Member
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1. Meetings */}
          {searchResults.meetings.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#8b949e',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Calendar size={13} />
                <span>Meetings ({searchResults.meetings.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.meetings.map((m) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `meeting-${m.id}`);
                  const isSelected = itemIndex === selectedIndex;
                  const durMin = Math.round((m.durationSeconds || 0) / 60);

                  return (
                    <div
                      key={m.id}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToMeeting(m.id, 'summary');
                        setIsGlobalSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.14)' : '#1c2128',
                        border: isSelected ? '1px solid #6366f1' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#8b949e', marginTop: '2px' }}>
                          {formatDate(m.date)} · {durMin} min
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: isSelected ? '#6366f1' : '#484f58', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Decisions */}
          {searchResults.decisions.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={13} />
                <span>Decisions ({searchResults.decisions.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.decisions.map((d) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `decision-${d.id || d.text}`);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={d.id || d.text}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToMeeting(
                          d.meetingId,
                          d.timestamp !== null && d.timestamp !== undefined ? 'transcript' : 'summary',
                          d.timestamp
                        );
                        setIsGlobalSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1c2128',
                        border: isSelected ? '1px solid #38bdf8' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 500, color: '#f0f6fc', fontSize: '0.88rem' }}>
                          {d.text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '3px' }}>
                          {d.meetingTitle}
                          {d.timestamp !== null && d.timestamp !== undefined && (
                            <>
                              {' · '}
                              <span style={{ color: '#38bdf8' }}>{formatTime(d.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          flexShrink: 0
                        }}
                      >
                        Decision
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Actions */}
          {searchResults.actionItems.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#34d399',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckSquare size={13} />
                <span>Actions ({searchResults.actionItems.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.actionItems.map((a) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `action-${a.id}`);
                  const isSelected = itemIndex === selectedIndex;
                  const isMine = a.assigneeId === currentUser?.id || a.assigneeName === currentUser?.name;

                  return (
                    <div
                      key={a.id}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToMeeting(
                          a.meetingId,
                          a.timestamp !== undefined && a.timestamp !== null ? 'transcript' : 'actions',
                          a.timestamp
                        );
                        setIsGlobalSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(52, 211, 153, 0.12)' : '#1c2128',
                        border: isSelected ? '1px solid #34d399' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckSquare
                            size={14}
                            style={{ color: a.completed ? '#34d399' : '#8b949e', flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontWeight: 500,
                              color: a.completed ? '#8b949e' : '#f0f6fc',
                              fontSize: '0.88rem',
                              textDecoration: a.completed ? 'line-through' : 'none'
                            }}
                          >
                            {a.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '3px', marginLeft: '22px' }}>
                          Assigned to <span style={{ color: isMine ? '#c7d2fe' : '#cbd5e1' }}>{a.assigneeName}</span>
                          {' · '}
                          {a.meetingTitle}
                          {a.timestamp && (
                            <>
                              {' · '}
                              <span style={{ color: '#38bdf8' }}>{formatTime(a.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isMine && (
                        <span
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#a5b4fc',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            flexShrink: 0
                          }}
                        >
                          My Action
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Open Questions */}
          {searchResults.openQuestions.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#fbbf24',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <HelpCircle size={13} />
                <span>Open Questions ({searchResults.openQuestions.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.openQuestions.map((oq) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `question-${oq.id}`);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={oq.id}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToMeeting(
                          oq.meetingId,
                          oq.timestamp !== undefined && oq.timestamp !== null ? 'transcript' : 'summary',
                          oq.timestamp
                        );
                        setIsGlobalSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(251, 191, 36, 0.12)' : '#1c2128',
                        border: isSelected ? '1px solid #fbbf24' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 500, color: '#f0f6fc', fontSize: '0.88rem' }}>
                          "{oq.question}"
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '3px' }}>
                          {oq.speakerName ? `Raised by ${oq.speakerName} · ` : ''}
                          {oq.meetingTitle}
                          {oq.timestamp && (
                            <>
                              {' · '}
                              <span style={{ color: '#fbbf24' }}>{formatTime(oq.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          color: '#fbbf24',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          flexShrink: 0
                        }}
                      >
                        Unresolved
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Spoken Evidence (Transcripts) */}
          {searchResults.transcripts.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#c084fc',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={13} />
                <span>Spoken Evidence ({searchResults.transcripts.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.transcripts.slice(0, 10).map((t) => {
                  const itemIndex = flattenedItems.findIndex((fi) => fi.id === `utterance-${t.id}`);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={t.id}
                      data-selected={isSelected}
                      onClick={() => {
                        navigateToMeeting(t.meetingId, 'transcript', t.timestamp);
                        setIsGlobalSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(192, 132, 252, 0.12)' : '#1c2128',
                        border: isSelected ? '1px solid #c084fc' : '1px solid #30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.1s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                          "{t.text}"
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#f0f6fc' }}>{t.speakerName}</span>
                          {' · '}
                          <span style={{ color: '#38bdf8' }}>{formatTime(t.timestamp)}</span>
                          {' · '}
                          <span>{t.meetingTitle}</span>
                        </div>
                      </div>

                      <button
                        className="btn-secondary"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#c084fc',
                          borderColor: 'rgba(192, 132, 252, 0.3)',
                          flexShrink: 0
                        }}
                      >
                        <Play size={9} />
                        <span>Jump</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Search Prompt */}
          {!q && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Type to search meetings, decisions, action items, open questions, and spoken transcript quotes.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                Tip: Try natural queries like <strong>"my actions"</strong>, <strong>"decisions this week"</strong>, or <strong>"open questions"</strong>.
              </p>
            </div>
          )}

          {/* Searching Skeleton */}
          {isSearching && (
            <SearchSkeleton />
          )}

          {/* No Results Found */}
          {q && flattenedItems.length === 0 && !isSearching && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b949e' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#f0f6fc', marginBottom: '6px' }}>No results found.</h3>
              <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: 0 }}>
                Try searching for a meeting, decision, action, person, or spoken phrase.
              </p>
            </div>
          )}
        </div>

        {/* Footer with keyboard navigation guidance */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid #21262d',
            background: '#0d1117',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#8b949e'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem' }}>↑</kbd>
              <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem' }}>↓</kbd>
              <span>navigate</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem' }}>↵</kbd>
              <span>select</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '3px', padding: '1px 5px', fontSize: '0.7rem' }}>esc</kbd>
              <span>close</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Total Matches:</span>
            <strong style={{ color: '#f0f6fc' }}>{flattenedItems.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
