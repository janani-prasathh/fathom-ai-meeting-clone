import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Play, Share2, Tag, Scissors } from 'lucide-react';

export const HighlightsViewer: React.FC = () => {
  const { activeMeeting, seekTo, showToast } = useMeeting();

  if (!activeMeeting) return null;

  const highlights = activeMeeting.highlights || [];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyClipLink = (hTitle: string, start: number) => {
    navigator.clipboard?.writeText?.(window.location.href + `#t=${start}`);
    showToast(`Clip link for "${hTitle}" copied to clipboard!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '840px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <span>Curated Highlights & Key Moments</span>
          <span className="brand-badge">{highlights.length} Clips</span>
        </h3>
        <button
          className="btn-secondary"
          onClick={() => showToast('Clip created from current playhead position!')}
        >
          <Scissors size={14} />
          <span>New Clip</span>
        </button>
      </div>

      {highlights.map((h) => {
        const durationSecs = h.endTime - h.startTime;
        return (
          <div key={h.id} className="topic-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    fontWeight: 600,
                    marginRight: '8px'
                  }}
                >
                  {h.tag}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                  {h.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="timestamp-chip"
                  onClick={() => seekTo(h.startTime, true)}
                  title="Play this highlight clip"
                >
                  <Play size={10} />
                  <span>
                    {formatTime(h.startTime)} - {formatTime(h.endTime)} ({durationSecs}s)
                  </span>
                </button>

                <button
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  onClick={() => handleCopyClipLink(h.title, h.startTime)}
                  title="Share this specific highlight moment"
                >
                  <Share2 size={12} />
                  <span>Share Clip</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {h.summary}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Highlighted speaker: <span style={{ color: '#cbd5e1' }}>{h.speakerName}</span>
            </div>
          </div>
        );
      })}

      {highlights.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No highlights saved yet.
        </div>
      )}
    </div>
  );
};
