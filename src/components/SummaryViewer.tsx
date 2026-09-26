import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { MeetingIntelligence } from './MeetingIntelligence';
import { Sparkles, CheckCircle, FileText, Play, Layers } from 'lucide-react';

export const SummaryViewer: React.FC = () => {
  const { activeMeeting, setMeetingTemplate, seekTo } = useMeeting();

  if (!activeMeeting) return null;

  const templates = activeMeeting.templates || {};
  const currentTemplateKey = activeMeeting.activeTemplate || 'executive';
  const currentTemplate =
    templates[currentTemplateKey] ||
    templates.executive ||
    Object.values(templates)[0] || {
      key: 'executive',
      name: 'Executive Summary',
      description: 'High-level synthesis',
      overview: activeMeeting.overview || '',
      sections: []
    };

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
            {Object.values(templates).map((t) => (
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

      {/* Interactive Meeting Intelligence Section with strict 6-part hierarchy */}
      <MeetingIntelligence
        meeting={activeMeeting}
        templateOverview={currentTemplate.overview}
        templateSections={currentTemplate.sections}
      />
    </div>
  );
};
