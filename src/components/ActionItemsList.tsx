import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Check, Play, ExternalLink } from 'lucide-react';

export const ActionItemsList: React.FC<{ onOpenTranscript?: () => void }> = ({ onOpenTranscript }) => {
  const { activeMeeting, toggleActionItem, seekTo, openEvidenceExplorer } = useMeeting();

  if (!activeMeeting) return null;

  const actionItems = activeMeeting.actionItems || [];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekEvidence = (secs: number) => {
    seekTo(secs, true);
    if (onOpenTranscript) {
      onOpenTranscript();
    }
  };

  return (
    <div className="action-items-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <span>Action Items & Commitments</span>
          <span className="brand-badge">{actionItems.length} Total</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click timestamp to verify spoken audio evidence
        </span>
      </div>

      {actionItems.map((item) => (
        <div
          key={item.id}
          className={`action-item-card ${item.completed ? 'completed' : ''}`}
        >
          <div className="action-item-top">
            <div className="action-item-checkbox-row">
              <div
                className={`custom-checkbox ${item.completed ? 'checked' : ''}`}
                onClick={() => toggleActionItem(activeMeeting.id, item.id)}
                title={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed && <Check size={14} />}
              </div>

              <div className="action-item-text">{item.title}</div>
            </div>

            <div className="action-assignee-pill">
              <img src={item.assignee.avatar} alt={item.assignee.name} />
              <span>{item.assignee.name}</span>
            </div>
          </div>

          {/* Direct Evidence Provenance */}
          <div className="action-evidence-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span>"{item.sourceQuote}"</span>
              {item.confidence !== undefined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEvidenceExplorer({
                      id: item.id,
                      type: 'action',
                      title: item.title,
                      meetingId: activeMeeting.id,
                      meetingTitle: activeMeeting.title,
                      assigneeName: item.assignee.name,
                      assigneeAvatar: item.assignee.avatar,
                      timestamp: item.timestamp,
                      sourceQuote: item.sourceQuote,
                      confidence: item.confidence,
                      sourceUtteranceId: item.sourceUtteranceId
                    });
                  }}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#34d399',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Inspect full Evidence Explorer panel"
                >
                  ✓ {Math.round(item.confidence * 100)}% grounded
                </button>
              )}
            </div>
            <button
              className="timestamp-chip"
              onClick={() => handleSeekEvidence(item.timestamp)}
              title="Jump to this exact moment in the call video & transcript"
            >
              <Play size={10} />
              <span>Jump to {formatTime(item.timestamp)}</span>
            </button>
          </div>
        </div>
      ))}

      {actionItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No action items detected for this meeting.
        </div>
      )}
    </div>
  );
};
