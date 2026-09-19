import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Check, Play, ExternalLink } from 'lucide-react';

export const ActionItemsList: React.FC<{ onOpenTranscript?: () => void }> = ({ onOpenTranscript }) => {
  const { activeMeeting, toggleActionItem, seekTo } = useMeeting();

  if (!activeMeeting) return null;

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
          <span className="brand-badge">{activeMeeting.actionItems.length} Total</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click timestamp to verify spoken audio evidence
        </span>
      </div>

      {activeMeeting.actionItems.map((item) => (
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
            <span>"{item.sourceQuote}"</span>
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

      {activeMeeting.actionItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No action items detected for this meeting.
        </div>
      )}
    </div>
  );
};
