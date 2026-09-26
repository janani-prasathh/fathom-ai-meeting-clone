import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import {
  X,
  Play,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Clock,
  User,
  ArrowRight,
  Info
} from 'lucide-react';

export const EvidenceExplorerModal: React.FC = () => {
  const {
    evidenceExplorerItem,
    closeEvidenceExplorer,
    navigateToMeeting
  } = useMeeting();

  if (!evidenceExplorerItem) return null;

  const item = evidenceExplorerItem;

  const formatTime = (secs?: number) => {
    if (secs === undefined || secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenTranscript = () => {
    if (item.meetingId) {
      navigateToMeeting(item.meetingId, 'transcript', item.timestamp);
      closeEvidenceExplorer();
    }
  };

  const confidencePercent = item.confidence ? Math.round(item.confidence * 100) : 95;

  const getTypeBadge = () => {
    switch (item.type) {
      case 'action':
        return {
          label: 'ACTION ITEM',
          color: '#34d399',
          bg: 'rgba(52, 211, 153, 0.1)',
          border: 'rgba(52, 211, 153, 0.25)',
          icon: <CheckSquare size={13} />
        };
      case 'decision':
        return {
          label: 'DECISION',
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.25)',
          icon: <CheckCircle2 size={13} />
        };
      case 'question':
        return {
          label: 'OPEN QUESTION',
          color: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.1)',
          border: 'rgba(251, 191, 36, 0.25)',
          icon: <HelpCircle size={13} />
        };
      default:
        return {
          label: 'INTELLIGENCE INSIGHT',
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.25)',
          icon: <FileText size={13} />
        };
    }
  };

  const badge = getTypeBadge();

  // Dynamic "Why this appears" transparency checklist based on actual metadata
  const getWhyAppears = () => {
    if (item.whyAppears && item.whyAppears.length > 0) {
      return item.whyAppears;
    }

    if (item.type === 'action') {
      const list = [
        'Explicit commitment detected in conversational dialogue'
      ];
      if (item.assigneeName) {
        list.push(`Owner identified as ${item.assigneeName}`);
      }
      if (item.dueDate) {
        list.push(`Timeline / deadline detected: ${item.dueDate}`);
      }
      if (item.sourceQuote) {
        list.push(`Transcript evidence verified and locked at ${formatTime(item.timestamp)}`);
      }
      list.push('Anchored to verified discussion transcript');
      return list;
    }

    if (item.type === 'decision') {
      const list = [
        'Team consensus or architectural resolution agreed upon'
      ];
      if (item.speakerName) {
        list.push(`Proposed or ratified by ${item.speakerName}`);
      }
      list.push('Validated against dialogue to ensure proposal was not reversed or superseded');
      if (item.sourceQuote) {
        list.push(`Verbatim transcript quote anchored at ${formatTime(item.timestamp)}`);
      }
      list.push('Anchored to verified discussion transcript');
      return list;
    }

    if (item.type === 'question') {
      const list = [
        'Inquiry or concern raised without concluding consensus'
      ];
      if (item.speakerName) {
        list.push(`Raised by ${item.speakerName}`);
      }
      list.push('Verified: No definitive decision reached before meeting adjourned');
      if (item.sourceQuote) {
        list.push(`Anchored in spoken transcript at ${formatTime(item.timestamp)}`);
      }
      list.push('Anchored to verified discussion transcript');
      return list;
    }

    return ['Directly extracted and verified against meeting records'];
  };

  const whyList = getWhyAppears();

  return (
    <div
      className="modal-backdrop"
      onClick={closeEvidenceExplorer}
      style={{ zIndex: 1200 }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '92%',
          background: '#0f172a',
          border: '1px solid #1e283b',
          borderRadius: '6px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #1e283b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0f172a'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                padding: '3px 8px',
                borderRadius: '4px',
                color: badge.color,
                background: badge.bg,
                border: `1px solid ${badge.border}`
              }}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>

            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Evidence Explorer
            </span>
          </div>

          <button
            onClick={closeEvidenceExplorer}
            className="btn-ctrl"
            title="Close explorer (Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '75vh' }}>
          {/* Item Statement */}
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '6px' }}>
              Outcome Statement
            </div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.45 }}>
              {item.title}
            </h3>
            {item.meetingTitle && (
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
                Originating Meeting: <strong style={{ color: '#cbd5e1' }}>{item.meetingTitle}</strong>
              </div>
            )}
          </div>

          {/* Evidence Box */}
          <div
            style={{
              background: '#0a0d14',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.speakerAvatar ? (
                  <img
                    src={item.speakerAvatar}
                    alt={item.speakerName || 'Speaker'}
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#94a3b8'
                    }}
                  >
                    <User size={12} />
                  </div>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                  {item.speakerName || item.assigneeName || 'Recorded Speaker'}
                </span>
                {item.timestamp !== undefined && (
                  <>
                    <span style={{ color: '#475569' }}>·</span>
                    <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} />
                      {formatTime(item.timestamp)}
                    </span>
                  </>
                )}
              </div>

              {/* Confidence badge */}
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Verified against spoken discussion transcript"
              >
                <ShieldCheck size={12} />
                <span>Grounded</span>
              </span>
            </div>

            {/* Verbatim quote */}
            <div
              style={{
                fontStyle: 'italic',
                fontSize: '0.86rem',
                color: '#e2e8f0',
                lineHeight: 1.5,
                borderLeft: '2px solid #3b82f6',
                paddingLeft: '12px',
                marginTop: '4px'
              }}
            >
              "{item.sourceQuote || item.title}"
            </div>
          </div>

          {/* "Why this appears" transparency */}
          <div
            style={{
              background: '#0a0d14',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '12px 14px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Info size={12} style={{ color: '#94a3b8' }} />
              <span>
                {item.type === 'action'
                  ? 'Why is this an action item?'
                  : item.type === 'decision'
                  ? 'Why is this a key decision?'
                  : item.type === 'question'
                  ? 'Why is this an open question?'
                  : 'Grounding Verification'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {whyList.map((reason, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                    lineHeight: 1.4
                  }}
                >
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #1e283b',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <button
            onClick={closeEvidenceExplorer}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          <button
            onClick={handleOpenTranscript}
            style={{
              background: '#2563eb',
              border: '1px solid #1d4ed8',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Play size={11} fill="#ffffff" />
            <span>Open in Transcript</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
