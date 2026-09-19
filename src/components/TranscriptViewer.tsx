import React, { useState, useEffect, useRef } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Search, Compass, Play } from 'lucide-react';

export const TranscriptViewer: React.FC = () => {
  const { activeMeeting, currentTime, seekTo, activeUtteranceId } = useMeeting();
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll active utterance into view if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeUtteranceId, autoScroll]);

  if (!activeMeeting) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredUtterances = activeMeeting.transcript.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.text.toLowerCase().includes(q) ||
      u.speakerName.toLowerCase().includes(q)
    );
  });

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="highlight-match">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="transcript-container">
      <div className="transcript-search-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="transcript-search-input"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="btn-secondary"
          onClick={() => setAutoScroll(!autoScroll)}
          title="Toggle auto-follow speaker"
          style={{
            borderColor: autoScroll ? 'var(--accent-primary)' : 'var(--border-subtle)',
            color: autoScroll ? '#a5b4fc' : 'var(--text-muted)'
          }}
        >
          <Compass size={14} />
          <span>Follow speech: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="transcript-list">
        {filteredUtterances.map((u) => {
          const isActive = u.id === activeUtteranceId;
          return (
            <div
              key={u.id}
              ref={isActive ? activeRowRef : null}
              className={`utterance-row ${isActive ? 'active-utterance' : ''}`}
              onClick={() => seekTo(u.startTime, true)}
            >
              <img
                src={u.speakerAvatar}
                alt={u.speakerName}
                className="utterance-avatar"
              />

              <div className="utterance-body">
                <div className="utterance-header">
                  <span className="speaker-name-tag">{u.speakerName}</span>
                  <span
                    className="timestamp-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekTo(u.startTime, true);
                    }}
                  >
                    <Play size={10} />
                    {formatTime(u.startTime)}
                  </span>
                </div>

                <p className="utterance-text">
                  {highlightText(u.text, searchQuery)}
                </p>
              </div>
            </div>
          );
        })}

        {filteredUtterances.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No spoken dialogue found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
