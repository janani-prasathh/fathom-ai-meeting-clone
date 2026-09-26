import React from 'react';
import { Meeting } from '../types';
import { useMeeting } from '../context/MeetingContext';
import { Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const { setActiveMeetingId, seekTo } = useMeeting();

  const formattedDate = new Date(meeting.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const durationMin = Math.round((meeting.durationSeconds || 0) / 60);
  const actionItems = meeting.actionItems || [];
  const stats = (meeting as any).stats;
  const totalActions = actionItems.length || stats?.totalActions || 0;
  const completedActions = actionItems.length
    ? actionItems.filter((a) => a.completed).length
    : (stats?.completedActions || 0);
  const participants = meeting.participants || [];
  const tags = meeting.tags || [];

  const handleCardClick = () => {
    setActiveMeetingId(meeting.id);
    seekTo(0, false);
  };

  return (
    <div className="meeting-card" onClick={handleCardClick}>
      <div className="card-top">
        <div className="card-meta-pills">
          <span className="meta-pill">
            <Calendar size={12} />
            {formattedDate}
          </span>
          <span className="meta-pill duration">
            <Clock size={12} />
            {durationMin} mins
          </span>
        </div>
        {totalActions > 0 && (
          <span className="action-count-badge">
            <CheckSquare size={12} />
            {completedActions}/{totalActions} Actions
          </span>
        )}
      </div>

      <h3 className="card-title">{meeting.title}</h3>

      {meeting.originalCalendarTitle && meeting.originalCalendarTitle !== meeting.title && (
        <div className="card-original-title">
          Original calendar: {meeting.originalCalendarTitle}
        </div>
      )}

      <p className="card-overview">{meeting.overview}</p>

      <div className="card-participants">
        <div className="avatar-stack">
          {participants.map((p) => (
            <img
              key={p.id}
              src={p.avatar}
              alt={p.name}
              title={`${p.name} (${p.role})`}
            />
          ))}
        </div>

        <div className="card-badge-summary">
          {tags.slice(0, 2).map((t) => (
            <span key={t} className="meta-pill" style={{ fontSize: '0.7rem' }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
