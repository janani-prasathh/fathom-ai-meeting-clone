import React from 'react';
import { Meeting } from '../types';
import { useMeeting } from '../context/MeetingContext';
import { Sparkles, CheckCircle2, CheckSquare, HelpCircle, ArrowRight, Play } from 'lucide-react';

interface MeetingIntelligenceProps {
  meeting: Meeting;
}

export const MeetingIntelligence: React.FC<MeetingIntelligenceProps> = ({ meeting }) => {
  const { seekTo } = useMeeting();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Decisions list
  const decisions = meeting.keyDecisionDetails && meeting.keyDecisionDetails.length > 0
    ? meeting.keyDecisionDetails
    : (meeting.keyDecisions || []).map((text, idx) => ({
        id: `dec-${idx}`,
        text,
        timestamp: undefined
      }));

  // Action items
  const actionItems = meeting.actionItems || [];

  // Open questions
  const openQuestions = meeting.openQuestions || [];

  const handleSeek = (timestamp?: number) => {
    if (timestamp !== undefined) {
      seekTo(timestamp, true);
    }
  };

  return (
    <div
      className="topic-card"
      style={{
        background: 'linear-gradient(180deg, rgba(24, 29, 40, 0.85) 0%, rgba(17, 20, 28, 0.95) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow-md), 0 0 24px rgba(99, 102, 241, 0.05)',
        marginBottom: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#f8fafc', margin: 0 }}>
              Meeting Intelligence
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Traceable insights connected to conversation evidence
            </p>
          </div>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          Click any insight to seek audio/video
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Subsection 1: Decisions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Decisions ({decisions.length})</span>
            </span>
          </div>

          {decisions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {decisions.map((dec, idx) => (
                <div
                  key={dec.id || idx}
                  onClick={() => handleSeek(dec.timestamp)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: dec.timestamp !== undefined ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)'
                  }}
                  className={dec.timestamp !== undefined ? 'glow-border' : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span
                      style={{
                        color: 'var(--accent-success)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        marginTop: '1px'
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.45, fontWeight: 500 }}>
                      {dec.text}
                    </span>
                  </div>

                  {dec.timestamp !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#818cf8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        <Play size={10} style={{ fill: '#818cf8' }} />
                        <span>{formatTime(dec.timestamp)} · View in transcript →</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
              No key decisions identified
            </div>
          )}
        </div>

        {/* Subsection 2: Action Items */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckSquare size={13} style={{ color: 'var(--accent-success)' }} />
              <span>Action Items ({actionItems.length})</span>
            </span>
          </div>

          {actionItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionItems.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleSeek(act.timestamp)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: act.timestamp !== undefined ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)'
                  }}
                  className={act.timestamp !== undefined ? 'glow-border' : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span
                      style={{
                        color: act.completed ? 'var(--accent-success)' : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        marginTop: '1px'
                      }}
                    >
                      {act.completed ? '✓' : '○'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.45 }}>
                        <strong style={{ color: '#93c5fd' }}>{act.assignee.name}</strong> — {act.title}
                      </span>
                    </div>
                  </div>

                  {act.timestamp !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#34d399',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        <Play size={10} style={{ fill: '#34d399' }} />
                        <span>{formatTime(act.timestamp)} · View evidence →</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
              No action items identified
            </div>
          )}
        </div>

        {/* Subsection 3: Open Questions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={13} style={{ color: 'var(--accent-warning)' }} />
              <span>Open Questions ({openQuestions.length})</span>
            </span>
          </div>

          {openQuestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openQuestions.map((oq) => (
                <div
                  key={oq.id}
                  onClick={() => handleSeek(oq.timestamp)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: oq.timestamp !== undefined ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)'
                  }}
                  className={oq.timestamp !== undefined ? 'glow-border' : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span
                      style={{
                        color: 'var(--accent-warning)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        marginTop: '1px'
                      }}
                    >
                      ?
                    </span>
                    <span style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.45, fontStyle: 'italic' }}>
                      "{oq.question}"
                    </span>
                  </div>

                  {oq.timestamp !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#fbbf24',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        <Play size={10} style={{ fill: '#fbbf24' }} />
                        <span>
                          {oq.speakerName ? `${oq.speakerName} · ` : ''}
                          {formatTime(oq.timestamp)} · View discussion →
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
              No open questions identified
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
