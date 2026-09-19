import React, { useState, useEffect } from 'react';
import { Meeting } from '../types';
import { useMeeting } from '../context/MeetingContext';
import { Mail, X, Copy, RotateCcw, Check, Sparkles } from 'lucide-react';

interface FollowUpEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

export const FollowUpEmailModal: React.FC<FollowUpEmailModalProps> = ({
  isOpen,
  onClose,
  meeting
}) => {
  const { showToast } = useMeeting();
  const [styleIndex, setStyleIndex] = useState(0);

  // Email state
  const [toField, setToField] = useState('');
  const [subjectField, setSubjectField] = useState('');
  const [bodyField, setBodyField] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate deterministic email content strictly from current meeting data
  const generateEmail = (m: Meeting, variant: number) => {
    // 1. To recipients: attendees
    const recipients = m.participants.map((p) => `${p.name} <${p.email}>`).join(', ');

    // 2. Subject line
    const subject = `Follow-up: ${m.title} — Next Steps`;

    // 3. Attendee names for greeting
    const firstNames = m.participants.map((p) => p.name.split(' ')[0]);
    let greeting = '';
    if (firstNames.length > 0) {
      greeting = `Hi ${firstNames.join(', ')},`;
    } else {
      greeting = 'Hi team,';
    }

    // Format timestamps [mm:ss]
    const formatTime = (secs: number) => {
      const min = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // 4. Build body sections
    const lines: string[] = [];
    lines.push(greeting);
    lines.push('');

    if (variant === 0) {
      lines.push(`Thanks for the discussion today on ${m.title}.`);
      lines.push(`${m.overview}`);
    } else if (variant === 1) {
      lines.push(`Great connecting today. Here is a concise synthesis of decisions and commitments from our sync on "${m.title}".`);
      lines.push(`${m.overview}`);
    } else {
      lines.push(`Following up on our session regarding "${m.title}". Below is a recap of key decisions, assigned deliverables, and next steps.`);
      lines.push(`${m.overview}`);
    }
    lines.push('');

    // Key Decisions / Takeaways
    if (m.keyDecisions && m.keyDecisions.length > 0) {
      lines.push('### Key Takeaways & Decisions');
      m.keyDecisions.forEach((d) => {
        lines.push(`• ${d}`);
      });
      lines.push('');
    }

    // Action Items
    if (m.actionItems && m.actionItems.length > 0) {
      lines.push('### Action Items');
      m.actionItems.forEach((act) => {
        const timeRef = act.timestamp ? ` (discussed at ${formatTime(act.timestamp)})` : '';
        lines.push(`• ${act.title} — Owner: ${act.assignee.name}${timeRef}`);
      });
      lines.push('');
    }

    // Next Steps & Agenda Topics
    if (m.topics && m.topics.length > 0) {
      lines.push('### Next Steps & Discussion Areas');
      m.topics.forEach((t) => {
        lines.push(`• ${t.title}: ${t.bullets[0] || 'Follow up on deliverables'}`);
      });
      lines.push('');
    }

    lines.push('Please let me know if anything needs adjustment or if you have any questions.');
    lines.push('');
    lines.push('Best regards,');
    lines.push('Janani');

    return {
      to: recipients,
      subject,
      body: lines.join('\n')
    };
  };

  // Re-generate when meeting changes or modal opens
  useEffect(() => {
    if (isOpen && meeting) {
      const generated = generateEmail(meeting, styleIndex);
      setToField(generated.to);
      setSubjectField(generated.subject);
      setBodyField(generated.body);
      setCopied(false);
    }
  }, [isOpen, meeting, styleIndex]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !meeting) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(bodyField);
    setCopied(true);
    showToast('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = () => {
    const nextIdx = (styleIndex + 1) % 3;
    setStyleIndex(nextIdx);
    const regenerated = generateEmail(meeting, nextIdx);
    setBodyField(regenerated.body);
    showToast('Email regenerated from meeting intelligence');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Mail size={17} />
            </div>
            <div>
              <h3>Follow-up Email</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Generated from "{meeting.title}"
              </p>
            </div>
          </div>

          <button
            className="btn-ctrl"
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px', gap: '14px' }}>
          {/* To Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                width: '60px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              To:
            </label>
            <input
              type="text"
              value={toField}
              onChange={(e) => setToField(e.target.value)}
              style={{
                flex: 1,
                height: '38px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Subject Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                width: '60px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Subject:
            </label>
            <input
              type="text"
              value={subjectField}
              onChange={(e) => setSubjectField(e.target.value)}
              style={{
                flex: 1,
                height: '38px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Editable Email Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Email Body (Editable)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Format: Markdown / Plain text
              </span>
            </div>

            <textarea
              value={bodyField}
              onChange={(e) => setBodyField(e.target.value)}
              rows={14}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
              marginTop: '4px'
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRegenerate}
              title="Regenerate format using same meeting facts"
            >
              <RotateCcw size={14} />
              <span>Regenerate Style</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-record-sim"
                onClick={handleCopy}
                style={{
                  background: copied
                    ? 'var(--accent-success)'
                    : 'linear-gradient(135deg, #4f46e5, #6366f1)'
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
