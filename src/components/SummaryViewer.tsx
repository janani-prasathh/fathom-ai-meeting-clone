import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { MeetingIntelligence } from './MeetingIntelligence';
import { Sparkles, CheckCircle, FileText, Play, Layers } from 'lucide-react';

export const SummaryViewer: React.FC = () => {
  const { activeMeeting, setMeetingTemplate, seekTo } = useMeeting();

  if (!activeMeeting) return null;

  const currentTemplateKey = activeMeeting.activeTemplate || 'executive';
  const currentTemplate =
    activeMeeting.templates[currentTemplateKey] ||
    activeMeeting.templates.executive ||
    Object.values(activeMeeting.templates)[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="summary-container">
      {/* Template Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Summary Template:
          </span>
          <select
            value={currentTemplateKey}
            onChange={(e) => setMeetingTemplate(activeMeeting.id, e.target.value)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {Object.values(activeMeeting.templates).map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {currentTemplate.description}
        </span>
      </div>

      {/* Interactive Meeting Intelligence Section */}
      <MeetingIntelligence meeting={activeMeeting} />

      {/* Executive Overview Box */}
      <div className="summary-overview-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)' }}>
          <Sparkles size={16} />
          <span style={{ fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Executive Synthesis
          </span>
        </div>
        <p>{currentTemplate.overview || activeMeeting.overview}</p>
      </div>

      {/* Key Decisions */}
      {activeMeeting.keyDecisions && activeMeeting.keyDecisions.length > 0 && (
        <div>
          <h3 className="section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent-warning)' }} />
            <span>Key Decisions Made</span>
          </h3>
          <div className="decision-list">
            {activeMeeting.keyDecisions.map((d, i) => (
              <div key={i} className="decision-item">
                <span className="decision-icon">✦</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template-Specific Structured Sections */}
      {currentTemplate.sections && currentTemplate.sections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentTemplate.sections.map((section, idx) => (
            <div key={idx} className="topic-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '10px' }}>
                {section.heading}
              </h4>
              <ul className="bullet-list">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Topics Discussed Accordion */}
      <div>
        <h3 className="section-title">
          <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Agenda & Topics Discussed</span>
        </h3>
        <div className="topic-accordion">
          {activeMeeting.topics.map((topic, i) => (
            <div key={i} className="topic-card">
              <div className="topic-header">
                <span className="topic-title">{topic.title}</span>
                <button
                  className="timestamp-chip"
                  onClick={() => seekTo(topic.timestamp, true)}
                  title={`Seek video to ${formatTime(topic.timestamp)}`}
                >
                  <Play size={10} />
                  <span>{formatTime(topic.timestamp)}</span>
                </button>
              </div>
              <ul className="bullet-list">
                {topic.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
