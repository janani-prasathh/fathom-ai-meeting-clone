import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Search, X, MessageSquare, CheckSquare, Calendar, Play, Sparkles, ArrowRight, Bot } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    meetings,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    setActiveMeetingId,
    seekTo
  } = useMeeting();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ai'>('all');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      } else if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.trim().toLowerCase();

  // Search matches
  const matchedMeetings = q
    ? meetings.filter((m) => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)))
    : [];

  const matchedTranscripts: { meetingId: string; meetingTitle: string; speakerName: string; text: string; timestamp: number }[] = [];
  const matchedActions: { meetingId: string; meetingTitle: string; actionTitle: string; assignee: string; timestamp: number }[] = [];

  if (q) {
    meetings.forEach((m) => {
      m.transcript.forEach((u) => {
        if (u.text.toLowerCase().includes(q)) {
          matchedTranscripts.push({
            meetingId: m.id,
            meetingTitle: m.title,
            speakerName: u.speakerName,
            text: u.text,
            timestamp: u.startTime
          });
        }
      });

      m.actionItems.forEach((a) => {
        if (a.title.toLowerCase().includes(q) || a.assignee.name.toLowerCase().includes(q)) {
          matchedActions.push({
            meetingId: m.id,
            meetingTitle: m.title,
            actionTitle: a.title,
            assignee: a.assignee.name,
            timestamp: a.timestamp
          });
        }
      });
    });
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectResult = (meetingId: string, timestamp?: number) => {
    setActiveMeetingId(meetingId);
    if (timestamp !== undefined) {
      seekTo(timestamp, true);
    }
    setIsGlobalSearchOpen(false);
  };

  const handleAskCrossMeeting = () => {
    if (!q) return;
    if (q.includes('smarteval') || q.includes('benchmark') || q.includes('latency')) {
      setAiAnswer(
        `SmartEval is discussed primarily in two meetings: 
1. "SmartEval LLM Benchmark & Evaluation Architecture" (where Sarah Chen dropped latency from 12s to 2.1s using SQLite cache).
2. "Enterprise Customer Advisory: Acme Corp & SmartEval Pilot" (where Thomas Wright confirmed Acme's 50-seat pilot pending the 2-second SLA).`
      );
    } else if (q.includes('pilot') || q.includes('acme') || q.includes('pricing') || q.includes('seats')) {
      setAiAnswer(
        `Acme Corp pilot terms were negotiated in "Enterprise Customer Advisory: Acme Corp & SmartEval Pilot":
• 50 developer seats starting October 1st.
• Potential expansion to 400 seats in Q1.
• Required 99.9% uptime SLA and zero-data-retention guarantee.`
      );
    } else if (q.includes('sharing') || q.includes('undo') || q.includes('title')) {
      setAiAnswer(
        `In "AI Meeting Intelligence v2 — Product Roadmap & UX Sync", Marcus Vance and Maya Patel redesigned the sharing UX to include:
• Surfacing meeting attendees for 1-click sharing.
• Security confirmation for external recipients.
• A 5-second undo toast with access revocation.
• Automatic smart title generation for generic "Impromptu" meetings.`
      );
    } else {
      setAiAnswer(
        `Across your meetings, "${query}" matches discussions in ${matchedMeetings.length > 0 ? matchedMeetings.map(m => m.title).join(', ') : 'multiple transcripts'}. Review the search results below to jump directly to exact quotes.`
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsGlobalSearchOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '14px 20px' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ color: 'var(--accent-primary)', marginRight: 12 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search all meetings, transcripts, action items, or ask AI..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAiAnswer(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <button
            className="btn-ctrl"
            onClick={() => setIsGlobalSearchOpen(false)}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', padding: '0 20px' }}>
          <button
            className={`intel-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{ padding: '10px 14px', fontSize: '0.8rem' }}
          >
            All Results ({matchedMeetings.length + matchedTranscripts.length + matchedActions.length})
          </button>
          <button
            className={`intel-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ai');
              handleAskCrossMeeting();
            }}
            style={{ padding: '10px 14px', fontSize: '0.8rem' }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>Ask Cross-Meeting AI</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px 20px', gap: '16px' }}>
          {/* AI Answer Card */}
          {(activeTab === 'ai' || aiAnswer) && q && (
            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                <Bot size={15} />
                <span>Cross-Meeting AI Answer:</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#f8fafc', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                {aiAnswer || 'Click "Ask Cross-Meeting AI" or type a question...'}
              </p>
            </div>
          )}

          {/* Category: Meetings */}
          {matchedMeetings.length > 0 && (
            <div>
              <div className="share-section-title">Meetings ({matchedMeetings.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchedMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectResult(m.id)}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                    className="glow-border"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{m.title}</span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {m.overview.slice(0, 110)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Spoken Transcript Quotes */}
          {matchedTranscripts.length > 0 && (
            <div>
              <div className="share-section-title">Spoken Quotes ({matchedTranscripts.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchedTranscripts.slice(0, 5).map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectResult(t.meetingId, t.timestamp)}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)'
                    }}
                    className="glow-border"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                        {t.meetingTitle} • {t.speakerName}
                      </span>
                      <span className="timestamp-chip" style={{ fontSize: '0.7rem' }}>
                        <Play size={8} />
                        {formatTime(t.timestamp)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                      "{t.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category: Action Items */}
          {matchedActions.length > 0 && (
            <div>
              <div className="share-section-title">Action Items ({matchedActions.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchedActions.map((a, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectResult(a.meetingId, a.timestamp)}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    className="glow-border"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckSquare size={15} style={{ color: 'var(--accent-success)' }} />
                      <span style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{a.actionTitle}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Assignee: {a.assignee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!q && (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <Search size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.88rem' }}>
                Type keywords like <strong>"SmartEval"</strong>, <strong>"latency"</strong>, <strong>"pilot"</strong>, or <strong>"sharing"</strong> to search across all meetings and transcripts.
              </p>
            </div>
          )}

          {q && matchedMeetings.length === 0 && matchedTranscripts.length === 0 && matchedActions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No matches found across meetings for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
