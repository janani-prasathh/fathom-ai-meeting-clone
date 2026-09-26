import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { DashboardSkeleton } from '../components/SkeletonLoaders';
import {
  CheckSquare,
  Compass,
  HelpCircle,
  ArrowRight,
  Clock,
  Play,
  CheckCircle2,
  Video,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    meetings,
    userMeetings,
    currentUser,
    userActions,
    userActionStats,
    setActiveView,
    toggleActionItem,
    navigateToMeeting,
    setIsAccountModalOpen,
    openEvidenceExplorer,
    isLoading,
    error,
    reloadMeetings
  } = useMeeting();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [userDecisions, setUserDecisions] = useState<any[]>([]);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);

  // Load personalized decisions and questions affecting current user
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPersonal(true);

    Promise.all([
      api.getUserDecisions(currentUser.id).catch(() => ({ count: 0, decisions: [] })),
      api.getUserQuestions(currentUser.id).catch(() => ({ count: 0, openQuestions: [] }))
    ]).then(([decRes, qRes]) => {
      if (isMounted) {
        setUserDecisions(decRes.decisions);
        setUserQuestions(qRes.openQuestions);
      }
    }).finally(() => {
      if (isMounted) setIsLoadingPersonal(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'there';
  const pendingActions = userActions.filter((a) => !a.completed).slice(0, 5);

  const formatTime = (secs?: number) => {
    if (secs === undefined || secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = async (meetingId: string, actionId: string) => {
    setTogglingId(actionId);
    try {
      await toggleActionItem(meetingId, actionId);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading && meetings.length === 0) {
    return (
      <main className="dashboard-content" style={{ padding: '32px 40px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <DashboardSkeleton />
      </main>
    );
  }

  if (error && meetings.length === 0) {
    return (
      <main className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '24px 32px', textAlign: 'center', maxWidth: '480px' }}>
          <AlertCircle size={36} style={{ color: '#f87171', margin: '0 auto 12px auto' }} />
          <h3 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '1.05rem' }}>Backend Connection Error</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '18px' }}>
            {error}
          </p>
          <button
            className="btn-primary"
            onClick={() => reloadMeetings()}
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      </main>
    );
  }

  // Display either user meetings or recent workspace meetings
  const displayMeetings = (userMeetings.length > 0 ? userMeetings : meetings).slice(0, 4);

  return (
    <main className="dashboard-content" style={{ padding: '28px 36px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
            Good morning, {firstName}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Here is your daily overview across active commitments, decisions, and meetings.
          </p>
        </div>

        <button
          onClick={() => setIsAccountModalOpen(true)}
          style={{
            background: '#0f172a',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Manage workspace account"
        >
          <UserCheck size={13} style={{ color: '#3b82f6' }} />
          <span>{currentUser.name}</span>
        </button>
      </div>

      {/* 2. Attention Metrics: Pending Actions, Due Soon, Open Questions, Recent Decisions */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '10px' }}>
          YOUR ATTENTION
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Pending Actions */}
          <div
            onClick={() => setActiveView('actions')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="attention-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Actions
              </span>
              <CheckSquare size={15} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
              {userActionStats.pending}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Outstanding commitments
            </div>
          </div>

          {/* Due Soon */}
          <div
            onClick={() => setActiveView('actions')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="attention-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Due Soon
              </span>
              <Clock size={15} style={{ color: '#f43f5e' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
              {userActionStats.dueSoon}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Due in next 48 hours
            </div>
          </div>

          {/* Open Questions */}
          <div
            onClick={() => setActiveView('questions')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="attention-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Open Questions
              </span>
              <HelpCircle size={15} style={{ color: '#fbbf24' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
              {userQuestions.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Unresolved in your calls
            </div>
          </div>

          {/* Recent Decisions */}
          <div
            onClick={() => setActiveView('decisions')}
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="attention-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Decisions
              </span>
              <Compass size={15} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
              {userDecisions.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Recorded in your syncs
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Actions Section (Primary Work Object) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399' }}>
            MY ACTIONS ({userActions.length})
          </div>

          <button
            onClick={() => setActiveView('actions')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {pendingActions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pendingActions.map((action) => (
              <div
                key={action.id}
                style={{
                  background: '#0f172a',
                  border: action.isDueSoon ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #1e283b',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {/* Direct Checkbox */}
                  <button
                    onClick={() => handleToggle(action.meetingId, action.id)}
                    disabled={togglingId === action.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Mark action completed"
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '4px',
                        border: action.isDueSoon ? '1.5px solid #f43f5e' : '1.5px solid #475569'
                      }}
                    />
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <div
                      onClick={() => navigateToMeeting(action.meetingId, 'actions')}
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#f1f5f9',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title="Open originating meeting"
                    >
                      {action.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {action.meetingTitle} · <span style={{ color: action.isDueSoon ? '#f43f5e' : '#64748b', fontWeight: action.isDueSoon ? 600 : 400 }}>{action.dueDateLabel}</span>
                    </div>
                  </div>
                </div>

                {action.timestamp !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() =>
                        openEvidenceExplorer({
                          id: action.id,
                          type: 'action',
                          title: action.title,
                          meetingId: action.meetingId,
                          meetingTitle: action.meetingTitle,
                          assigneeName: action.ownerName,
                          assigneeAvatar: action.ownerAvatar,
                          timestamp: action.timestamp,
                          sourceQuote: action.sourceQuote,
                          confidence: action.confidence,
                          sourceUtteranceId: action.sourceUtteranceId,
                          dueDate: action.dueDateLabel
                        })
                      }
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        color: '#34d399',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                      title="Inspect in Evidence Explorer"
                    >
                      Grounded
                    </button>
                    <button
                      onClick={() => navigateToMeeting(action.meetingId, 'transcript', action.timestamp)}
                      style={{
                        background: '#1e283b',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                      title={`Jump to discussion evidence at ${formatTime(action.timestamp)}`}
                    >
                      <Clock size={11} />
                      <span>{formatTime(action.timestamp)}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '18px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.84rem'
            }}
          >
            No outstanding commitments right now.
          </div>
        )}
      </div>

      {/* 4. Recent Decisions Affecting You */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
            RECENT DECISIONS AFFECTING YOU
          </div>

          <button
            onClick={() => setActiveView('decisions')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {userDecisions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {userDecisions.slice(0, 3).map((d) => (
              <div
                key={d.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e283b',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => navigateToMeeting(d.meetingId, d.timestamp !== undefined ? 'transcript' : 'summary', d.timestamp)}
                    style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f1f5f9', cursor: 'pointer', lineHeight: 1.4 }}
                  >
                    {d.text}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    <span>{d.meetingTitle}</span>
                    {d.timestamp !== undefined && (
                      <>
                        <span> · </span>
                        <span style={{ color: '#38bdf8' }}>{formatTime(d.timestamp)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() =>
                      openEvidenceExplorer({
                        id: d.id,
                        type: 'decision',
                        title: d.text,
                        meetingId: d.meetingId,
                        meetingTitle: d.meetingTitle,
                        timestamp: d.timestamp,
                        sourceQuote: d.text,
                        confidence: d.confidence
                      })
                    }
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '4px',
                      padding: '2px 7px',
                      fontSize: '0.68rem',
                      color: '#38bdf8',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                    title="Inspect in Evidence Explorer"
                  >
                    Grounded
                  </button>
                  <button
                    onClick={() => navigateToMeeting(d.meetingId, d.timestamp !== undefined ? 'transcript' : 'summary', d.timestamp)}
                    style={{
                      background: '#1e283b',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={11} />
                    <span>Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '18px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.84rem'
            }}
          >
            No decisions recorded yet.
          </div>
        )}
      </div>

      {/* 5. Open Questions From Your Meetings */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fbbf24' }}>
            OPEN QUESTIONS FROM YOUR MEETINGS ({userQuestions.length})
          </div>

          <button
            onClick={() => setActiveView('questions')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {userQuestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {userQuestions.slice(0, 3).map((q) => (
              <div
                key={q.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e283b',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => navigateToMeeting(q.meetingId, q.timestamp !== undefined ? 'transcript' : 'summary', q.timestamp)}
                    style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f1f5f9', cursor: 'pointer', lineHeight: 1.4 }}
                  >
                    "{q.question}"
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    {q.speakerName ? <span>Raised by <strong>{q.speakerName}</strong> · </span> : null}
                    <span>{q.meetingTitle}</span>
                    {q.timestamp !== undefined && (
                      <>
                        <span> · </span>
                        <span style={{ color: '#fbbf24' }}>{formatTime(q.timestamp)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() =>
                      openEvidenceExplorer({
                        id: q.id,
                        type: 'question',
                        title: q.question,
                        meetingId: q.meetingId,
                        meetingTitle: q.meetingTitle,
                        speakerName: q.speakerName,
                        timestamp: q.timestamp,
                        sourceQuote: q.question,
                        confidence: q.confidence
                      })
                    }
                    style={{
                      background: 'rgba(251, 191, 36, 0.08)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      borderRadius: '4px',
                      padding: '2px 7px',
                      fontSize: '0.68rem',
                      color: '#fbbf24',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                    title="Inspect in Evidence Explorer"
                  >
                    Grounded
                  </button>
                  <button
                    onClick={() => navigateToMeeting(q.meetingId, q.timestamp !== undefined ? 'transcript' : 'summary', q.timestamp)}
                    style={{
                      background: '#1e283b',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                    title="Jump to where question was raised"
                  >
                    <Clock size={11} />
                    <span>Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '18px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.84rem'
            }}
          >
            All questions in your syncs are resolved. No open blockers.
          </div>
        )}
      </div>

      {/* 6. Recent Meetings (Supporting Evidence Layer) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            RECENT MEETINGS (EVIDENCE LAYER)
          </div>

          <button
            onClick={() => setActiveView('my-meetings')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {displayMeetings.map((m) => {
            const mDate = new Date(m.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            const durationMin = Math.round((m.durationSeconds || 0) / 60);
            const decisionsCount = m.stats?.decisionsCount ?? (m.keyDecisions?.length || 0);
            const myActionsCount = m.stats?.myActionsCount ?? (m.actionItems?.filter(a => a.assignee?.id === currentUser.id).length || 0);
            const questionsCount = m.stats?.questionsCount ?? (m.openQuestions?.length || 0);

            return (
              <div
                key={m.id}
                onClick={() => navigateToMeeting(m.id, 'summary')}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e283b',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                className="action-card-hover"
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    <span>{mDate} · {durationMin} min</span>
                    <span>·</span>
                    <span style={{ color: '#38bdf8' }}>{decisionsCount} Decisions</span>
                    <span>·</span>
                    <span style={{ color: '#34d399', fontWeight: myActionsCount > 0 ? 600 : 400 }}>{myActionsCount} My Actions</span>
                    <span>·</span>
                    <span style={{ color: '#fbbf24' }}>{questionsCount} Open Questions</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="avatar-stack">
                    {(m.participants || []).slice(0, 3).map((p) => (
                      <img
                        key={p.id}
                        src={p.avatar}
                        alt={p.name}
                        title={p.name}
                        style={{ width: 22, height: 22 }}
                      />
                    ))}
                  </div>
                  <ArrowRight size={13} style={{ color: '#64748b' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
