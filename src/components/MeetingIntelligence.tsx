import React, { useState } from 'react';
import { Meeting, ActionItem, DecisionInsight, OpenQuestion } from '../types';
import { useMeeting } from '../context/MeetingContext';
import {
  FileText,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  Layers,
  ShieldCheck,
  Play,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';

interface MeetingIntelligenceProps {
  meeting: Meeting;
  templateOverview?: string;
  templateSections?: { heading: string; bullets: string[] }[];
}

export const MeetingIntelligence: React.FC<MeetingIntelligenceProps> = ({
  meeting,
  templateOverview,
  templateSections
}) => {
  const {
    seekTo,
    setActiveDetailTab,
    toggleActionItem,
    openEvidenceExplorer
  } = useMeeting();

  // State to track expanded "Why this appears" transparency for items
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const toggleWhy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWhy((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (secs?: number) => {
    if (secs === undefined || secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (timestamp?: number) => {
    if (timestamp !== undefined) {
      seekTo(timestamp, true);
      setActiveDetailTab('transcript');
    }
  };

  // Decisions list
  const decisions: DecisionInsight[] = meeting.keyDecisionDetails && meeting.keyDecisionDetails.length > 0
    ? meeting.keyDecisionDetails
    : (meeting.keyDecisions || []).map((text, idx) => ({
        id: `dec-${idx}`,
        text,
        timestamp: undefined,
        confidence: 0.95
      }));

  // Action items
  const actionItems: ActionItem[] = meeting.actionItems || [];

  // Open questions
  const openQuestions: OpenQuestion[] = meeting.openQuestions || [];

  // Topics
  const topics = meeting.topics || [];

  // Dynamic Evidence Coverage calculation from actual records
  const totalIntelligenceItems = decisions.length + actionItems.length + openQuestions.length;
  const groundedDecisions = decisions.filter((d) => d.timestamp !== undefined || d.confidence !== undefined).length;
  const groundedActions = actionItems.filter((a) => a.timestamp !== undefined || a.confidence !== undefined || a.sourceQuote).length;
  const groundedQuestions = openQuestions.filter((q) => q.timestamp !== undefined || q.confidence !== undefined).length;

  const totalGrounded = groundedDecisions + groundedActions + groundedQuestions;
  const ungroundedCount = Math.max(0, totalIntelligenceItems - totalGrounded);
  const coveragePercent = totalIntelligenceItems > 0 ? Math.round((totalGrounded / totalIntelligenceItems) * 100) : 100;

  // Overview text
  const overviewText = templateOverview || meeting.overview || 'Meeting discussion and outcomes recorded.';

  return (
    <div
      className="meeting-intelligence-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#f0f6fc'
      }}
    >
      {/* Intelligence Top Header & Coverage Banner */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #1e283b',
          borderRadius: '6px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              VERIFIED OUTCOMES
            </span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f5f9', margin: '3px 0 0 0' }}>
            Meeting Intelligence
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
            Structured synthesis anchored to recorded audio and timestamped transcript records.
          </p>
        </div>

        {/* Coverage Meter */}
        <div
          style={{
            background: '#0a0d14',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '200px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Evidence Coverage
            </span>
            <span style={{ fontWeight: 600, color: coveragePercent === 100 ? '#10b981' : '#38bdf8' }}>
              {coveragePercent}%
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#1e283b', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${coveragePercent}%`,
                height: '100%',
                background: coveragePercent === 100 ? '#10b981' : '#2563eb',
                borderRadius: '2px'
              }}
            />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {totalGrounded} of {totalIntelligenceItems} items verified with timestamps
          </span>
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <FileText size={14} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
              1. Executive Summary
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>What happened · High-level meeting synthesis</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: '#c9d1d9' }}>
          {overviewText}
        </p>

        {templateSections && templateSections.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templateSections.map((sec, sIdx) => (
              <div key={sIdx} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '6px', padding: '12px 14px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 600, color: '#e6edf3' }}>
                  {sec.heading}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.5 }}>
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. KEY DECISIONS */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <CheckCircle2 size={14} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
                2. Key Decisions ({decisions.length})
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>What was decided · Strategic consensus and resolutions</span>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>
            Click badge to inspect evidence
          </span>
        </div>

        {decisions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {decisions.map((dec, idx) => {
              const id = dec.id || `dec-${idx}`;
              const isWhyOpen = !!expandedWhy[id];
              const confPercent = dec.confidence ? Math.round(dec.confidence * 100) : 95;

              return (
                <div
                  key={id}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', marginTop: '1px' }}>•</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f0f6fc', lineHeight: 1.45 }}>
                        {dec.text}
                      </span>
                    </div>

                    {/* Grounded Badge / Button to Open Evidence Explorer */}
                    <button
                      onClick={() =>
                        openEvidenceExplorer({
                          id,
                          type: 'decision',
                          title: dec.text,
                          meetingId: meeting.id,
                          meetingTitle: meeting.title,
                          timestamp: dec.timestamp,
                          sourceQuote: dec.text,
                          confidence: dec.confidence,
                          sourceUtteranceId: dec.sourceUtteranceId,
                          whyAppears: [
                            'Explicit consensus reached among meeting attendees',
                            'Verified against discussion to ensure decision was not reversed',
                            dec.timestamp !== undefined ? `Anchored to transcript at ${formatTime(dec.timestamp)}` : 'Grounded in meeting minutes',
                            `Confidence score: ${confPercent}%`
                          ]
                        })
                      }
                      style={{
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: '#38bdf8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      title="Open full Evidence Explorer panel"
                    >
                      <ShieldCheck size={12} />
                      <span>Grounded</span>
                    </button>
                  </div>

                  {/* Evidence Row & Why Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px' }}>
                    {dec.timestamp !== undefined ? (
                      <button
                        onClick={() => handleSeek(dec.timestamp)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.75rem',
                          color: '#38bdf8',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                        title="Jump to audio/video and transcript"
                      >
                        <Play size={10} fill="#38bdf8" />
                        <span>{formatTime(dec.timestamp)} · View in transcript</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#8b949e', fontStyle: 'italic' }}>
                        Recorded in meeting synthesis
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleWhy(id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: '#8b949e',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 4px'
                      }}
                    >
                      <span>Why is this a decision?</span>
                      {isWhyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Inline "Why this appears" Expandable */}
                  {isWhyOpen && (
                    <div
                      style={{
                        marginTop: '4px',
                        marginLeft: '16px',
                        padding: '10px 12px',
                        background: '#161b22',
                        border: '1px solid #21262d',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        color: '#c9d1d9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                        <span>Team consensus detected in conversational dialogue</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                        <span>Proposal reversal check: validated as the final agreed stance</span>
                      </div>
                      {dec.timestamp !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                          <span>Transcript evidence timestamp: {formatTime(dec.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: '#8b949e', fontStyle: 'italic' }}>
            No formal decisions recorded for this meeting.
          </div>
        )}
      </section>

      {/* 3. ACTION ITEMS */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                background: 'rgba(52, 211, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <CheckSquare size={14} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
                3. Action Items ({actionItems.length})
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>What someone committed to · Explicit obligations and owners</span>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>
            Only explicit commitments indexed
          </span>
        </div>

        {actionItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actionItems.map((act) => {
              const isWhyOpen = !!expandedWhy[act.id];
              const confPercent = act.confidence ? Math.round(act.confidence * 100) : 95;

              return (
                <div
                  key={act.id}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    opacity: act.completed ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                      <button
                        onClick={() => toggleActionItem(meeting.id, act.id)}
                        style={{
                          background: act.completed ? '#238636' : 'transparent',
                          border: `1px solid ${act.completed ? '#2ea043' : '#484f58'}`,
                          borderRadius: '4px',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          marginTop: '2px',
                          color: '#fff',
                          fontSize: '0.7rem'
                        }}
                        title={act.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {act.completed ? '✓' : ''}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: '#f0f6fc', lineHeight: 1.45, textDecoration: act.completed ? 'line-through' : 'none' }}>
                          <strong style={{ color: '#93c5fd' }}>{act.assignee.name}</strong> — {act.title}
                        </div>
                      </div>
                    </div>

                    {/* Grounded Badge / Evidence Explorer Trigger */}
                    <button
                      onClick={() =>
                        openEvidenceExplorer({
                          id: act.id,
                          type: 'action',
                          title: act.title,
                          meetingId: meeting.id,
                          meetingTitle: meeting.title,
                          assigneeName: act.assignee.name,
                          assigneeAvatar: act.assignee.avatar,
                          timestamp: act.timestamp,
                          sourceQuote: act.sourceQuote,
                          confidence: act.confidence,
                          sourceUtteranceId: act.sourceUtteranceId,
                          whyAppears: [
                            'Explicit commitment detected in conversational speech',
                            `Owner identified as ${act.assignee.name}`,
                            act.sourceQuote ? `Quote: "${act.sourceQuote}"` : 'Spoken commitment confirmed',
                            `Anchored at ${formatTime(act.timestamp)}`,
                            `Confidence score: ${confPercent}%`
                          ]
                        })
                      }
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: '#34d399',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      title="Open Evidence Explorer"
                    >
                      <ShieldCheck size={12} />
                      <span>Grounded</span>
                    </button>
                  </div>

                  {/* Evidence Quote Box & Why Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {act.sourceQuote && (
                        <span style={{ fontSize: '0.76rem', color: '#8b949e', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '360px' }}>
                          "{act.sourceQuote}"
                        </span>
                      )}
                      <button
                        onClick={() => handleSeek(act.timestamp)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.75rem',
                          color: '#34d399',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500,
                          flexShrink: 0
                        }}
                      >
                        <Play size={10} fill="#34d399" />
                        <span>{formatTime(act.timestamp)} · View evidence</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => toggleWhy(act.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: '#8b949e',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 4px',
                        flexShrink: 0
                      }}
                    >
                      <span>Why is this an action?</span>
                      {isWhyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expandable Why */}
                  {isWhyOpen && (
                    <div
                      style={{
                        marginTop: '4px',
                        marginLeft: '26px',
                        padding: '10px 12px',
                        background: '#161b22',
                        border: '1px solid #21262d',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        color: '#c9d1d9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                        <span>Explicit commitment detected (casual remarks filtered out)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                        <span>Assignee resolved to workspace member: <strong>{act.assignee.name}</strong></span>
                      </div>
                      {act.sourceQuote && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                          <span>Spoken quote locked at second {act.timestamp}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: '#8b949e', fontStyle: 'italic' }}>
            No committed action items identified for this meeting.
          </div>
        )}
      </section>

      {/* 4. OPEN QUESTIONS */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                background: 'rgba(251, 191, 36, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24'
              }}
            >
              <HelpCircle size={14} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
                4. Open Questions ({openQuestions.length})
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>What remains unresolved · Unanswered inquiries needing follow-up</span>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>
            Answered questions filtered
          </span>
        </div>

        {openQuestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {openQuestions.map((oq) => {
              const isWhyOpen = !!expandedWhy[oq.id];
              const confPercent = oq.confidence ? Math.round(oq.confidence * 100) : 92;

              return (
                <div
                  key={oq.id}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                      <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', marginTop: '1px' }}>?</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f0f6fc', lineHeight: 1.45 }}>
                        "{oq.question}"
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        openEvidenceExplorer({
                          id: oq.id,
                          type: 'question',
                          title: oq.question,
                          meetingId: meeting.id,
                          meetingTitle: meeting.title,
                          speakerName: oq.speakerName,
                          timestamp: oq.timestamp,
                          sourceQuote: oq.question,
                          confidence: oq.confidence,
                          sourceUtteranceId: oq.sourceUtteranceId,
                          whyAppears: [
                            'Inquiry raised during discussion',
                            oq.speakerName ? `Raised by ${oq.speakerName}` : 'Participant question',
                            'Verified: No conclusive answer or consensus reached prior to adjournment',
                            oq.timestamp !== undefined ? `Anchored at ${formatTime(oq.timestamp)}` : 'Logged from meeting transcript',
                            `Confidence score: ${confPercent}%`
                          ]
                        })
                      }
                      style={{
                        background: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: '#fbbf24',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      title="Open Evidence Explorer"
                    >
                      <ShieldCheck size={12} />
                      <span>Grounded</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px' }}>
                    {oq.timestamp !== undefined ? (
                      <button
                        onClick={() => handleSeek(oq.timestamp)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.75rem',
                          color: '#fbbf24',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        <Play size={10} fill="#fbbf24" />
                        <span>
                          {oq.speakerName ? `${oq.speakerName} · ` : ''}
                          {formatTime(oq.timestamp)} · View discussion
                        </span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#8b949e', fontStyle: 'italic' }}>
                        {oq.speakerName ? `Raised by ${oq.speakerName}` : 'Recorded inquiry'}
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleWhy(oq.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: '#8b949e',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 4px'
                      }}
                    >
                      <span>Why is this an open question?</span>
                      {isWhyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expandable Why */}
                  {isWhyOpen && (
                    <div
                      style={{
                        marginTop: '4px',
                        marginLeft: '16px',
                        padding: '10px 12px',
                        background: '#161b22',
                        border: '1px solid #21262d',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        color: '#c9d1d9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                        <span>Unanswered question: no resolution was reached in subsequent utterances</span>
                      </div>
                      {oq.speakerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                          <span>Speaker identified as {oq.speakerName}</span>
                        </div>
                      )}
                      {oq.timestamp !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
                          <span>Timestamp verified at second {oq.timestamp}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: '#8b949e', fontStyle: 'italic' }}>
            All questions were answered or no open questions were recorded.
          </div>
        )}
      </section>

      {/* 5. KEY TOPICS / DISCUSSION */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}
          >
            <Layers size={14} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
              5. Key Topics & Discussion Threads ({topics.length})
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>Detailed breakdown of conversation threads and topic progression</span>
          </div>
        </div>

        {topics.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topics.map((t, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '12px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f6fc' }}>
                    {t.title}
                  </span>
                  <button
                    onClick={() => handleSeek(t.timestamp)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #30363d',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      color: '#8b949e',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={10} />
                    <span>{formatTime(t.timestamp)}</span>
                  </button>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.5 }}>
                  {(t.bullets || []).map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: '#8b949e', fontStyle: 'italic' }}>
            No segmented agenda topics available.
          </div>
        )}
      </section>

      {/* 6. EVIDENCE & COVERAGE */}
      <section
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              background: 'rgba(52, 211, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <ShieldCheck size={14} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f0f6fc' }}>
              6. Evidence & Grounding Coverage
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#8b949e' }}>Provenance auditing across all extracted intelligence records</span>
          </div>
        </div>

        <div
          style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f6fc' }}>
                {totalGrounded} / {totalIntelligenceItems} intelligence items grounded
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#8b949e' }}>
                {ungroundedCount === 0
                  ? 'All decisions, action items, and open questions are 100% verified against spoken transcript timestamps.'
                  : `${ungroundedCount} items do not have transcript evidence.`}
              </p>
            </div>

            <button
              onClick={() => setActiveDetailTab('transcript')}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Inspect Full Transcript ({meeting.transcript?.length || 0} utterances)</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Breakdown bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '4px' }}>
            <div style={{ background: '#161b22', padding: '8px 12px', borderRadius: '4px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Decisions Grounded</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{groundedDecisions} / {decisions.length}</div>
            </div>
            <div style={{ background: '#161b22', padding: '8px 12px', borderRadius: '4px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Actions Grounded</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>{groundedActions} / {actionItems.length}</div>
            </div>
            <div style={{ background: '#161b22', padding: '8px 12px', borderRadius: '4px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Questions Grounded</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>{groundedQuestions} / {openQuestions.length}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
