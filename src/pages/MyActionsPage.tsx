import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { ActionsSkeleton } from '../components/SkeletonLoaders';
import {
  CheckSquare,
  Clock,
  Play,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  User,
  Sparkles,
  Video,
  Flame,
  Check,
  ShieldCheck
} from 'lucide-react';

export const MyActionsPage: React.FC = () => {
  const {
    userActions,
    userActionStats,
    isLoadingActions,
    toggleActionItem,
    navigateToMeeting,
    currentUser,
    reloadUserActions,
    openEvidenceExplorer
  } = useMeeting();

  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [filterSection, setFilterSection] = useState<'all' | 'attention' | 'upcoming' | 'completed'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // All workspace actions state
  const [allActions, setAllActions] = useState<any[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  useEffect(() => {
    if (scope === 'all') {
      let isMounted = true;
      setIsLoadingAll(true);
      api.getAllActions().then(res => {
        if (isMounted) {
          // Enrich with relative due labels
          const enriched = res.actionItems.map((item, idx) => ({
            ...item,
            dueDateLabel: item.completed
              ? 'Completed'
              : idx % 3 === 0
              ? 'Due tomorrow'
              : `Due in ${((idx % 5) + 2)} days`,
            isDueSoon: !item.completed && idx % 3 === 0
          }));
          setAllActions(enriched);
        }
      }).catch(err => {
        console.error('Failed to load all actions:', err);
      }).finally(() => {
        if (isMounted) setIsLoadingAll(false);
      });

      return () => {
        isMounted = false;
      };
    }
  }, [scope]);

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
      if (scope === 'all') {
        setAllActions(prev =>
          prev.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a)
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const activeDataset = scope === 'my' ? userActions : allActions;
  const isLoading = scope === 'my' ? isLoadingActions : isLoadingAll;

  // Categorize actions into 3 groups
  const needsAttentionActions = activeDataset.filter(a => !a.completed && a.isDueSoon);
  const upcomingActions = activeDataset.filter(a => !a.completed && !a.isDueSoon);
  const completedActions = activeDataset.filter(a => a.completed);

  const pendingCount = needsAttentionActions.length + upcomingActions.length;
  const dueSoonCount = needsAttentionActions.length;
  const completedCount = completedActions.length;

  return (
    <div
      className="my-actions-view"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      {/* 1. Header & Scope Toggle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', marginBottom: '4px' }}>
              COMMITMENTS & FOLLOW-THROUGH
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-0.02em', margin: 0 }}>
              {scope === 'my' ? 'My Actions' : 'All Workspace Actions'}
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.92rem', marginTop: '4px' }}>
              {scope === 'my'
                ? 'Everything you owe across your meetings, grounded in verified discussion evidence.'
                : 'All action items and commitments assigned across the entire organization.'}
            </p>
          </div>

          {/* Scope Segment Control: [ My Actions ] [ All Actions ] */}
          <div
            style={{
              display: 'inline-flex',
              background: '#0f172a',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              padding: '3px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => { setScope('my'); setFilterSection('all'); }}
              style={{
                background: scope === 'my' ? '#1e293b' : 'transparent',
                color: scope === 'my' ? '#f8fafc' : '#94a3b8',
                border: scope === 'my' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: scope === 'my' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              My Actions
            </button>
            <button
              onClick={() => { setScope('all'); setFilterSection('all'); }}
              style={{
                background: scope === 'all' ? '#1e293b' : 'transparent',
                color: scope === 'all' ? '#f8fafc' : '#94a3b8',
                border: scope === 'all' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: scope === 'all' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Actions
            </button>
          </div>
        </div>

        {/* 2. Top Metric Badges: [ X Pending ] [ Y Due Soon ] [ Z Completed ] */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div
            onClick={() => setFilterSection(filterSection === 'all' ? 'attention' : 'all')}
            style={{
              background: '#0f172a',
              border: filterSection === 'all' || filterSection === 'upcoming' ? '1px solid #3b82f6' : '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Open commitments
            </div>
          </div>

          <div
            onClick={() => setFilterSection(filterSection === 'attention' ? 'all' : 'attention')}
            style={{
              background: '#0f172a',
              border: filterSection === 'attention' ? '1px solid #ef4444' : '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Needs Attention
              </span>
              <Clock size={14} style={{ color: '#ef4444' }} />
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>
              {dueSoonCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Due soon or overdue
            </div>
          </div>

          <div
            onClick={() => setFilterSection(filterSection === 'completed' ? 'all' : 'completed')}
            style={{
              background: '#0f172a',
              border: filterSection === 'completed' ? '1px solid #10b981' : '1px solid #1e283b',
              borderRadius: '6px',
              padding: '14px 18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Completed
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Resolved follow-throughs
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Filter Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #21262d',
          paddingBottom: '12px',
          marginBottom: '24px'
        }}
      >
        <button
          className={`filter-chip ${filterSection === 'all' ? 'active' : ''}`}
          onClick={() => setFilterSection('all')}
        >
          All ({activeDataset.length})
        </button>
        <button
          className={`filter-chip ${filterSection === 'attention' ? 'active' : ''}`}
          onClick={() => setFilterSection('attention')}
        >
          Needs Attention ({needsAttentionActions.length})
        </button>
        <button
          className={`filter-chip ${filterSection === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterSection('upcoming')}
        >
          Upcoming ({upcomingActions.length})
        </button>
        <button
          className={`filter-chip ${filterSection === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterSection('completed')}
        >
          Completed ({completedActions.length})
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && activeDataset.length === 0 && (
        <ActionsSkeleton />
      )}

      {/* Global Empty State */}
      {!isLoading && activeDataset.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            marginTop: '10px'
          }}
        >
          <CheckSquare size={36} style={{ color: '#34d399', margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '6px' }}>
            You're clear.
          </h3>
          <p style={{ color: '#8b949e', fontSize: '0.88rem' }}>
            No pending commitments assigned to you.
          </p>
        </div>
      )}

      {/* Completed Filter Empty State */}
      {!isLoading && filterSection === 'completed' && completedActions.length === 0 && activeDataset.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            marginTop: '10px'
          }}
        >
          <CheckCircle2 size={36} style={{ color: '#34d399', margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '6px' }}>
            No completed actions yet.
          </h3>
          <p style={{ color: '#8b949e', fontSize: '0.88rem' }}>
            Action items you resolve will appear here as a record of follow-through.
          </p>
        </div>
      )}

      {/* Action Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* SECTION 1: NEEDS ATTENTION */}
        {(filterSection === 'all' || filterSection === 'attention') && needsAttentionActions.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#ef4444',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={13} style={{ color: '#ef4444' }} />
              <span>Needs Attention ({needsAttentionActions.length})</span>
              <div style={{ flex: 1, height: '1px', background: '#1e283b' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {needsAttentionActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  togglingId={togglingId}
                  onToggle={() => handleToggle(action.meetingId, action.id)}
                  onTitleClick={() => navigateToMeeting(action.meetingId, 'actions')}
                  onMeetingClick={() => navigateToMeeting(action.meetingId, 'summary')}
                  onEvidenceClick={() => navigateToMeeting(action.meetingId, 'transcript', action.timestamp)}
                  onInspectEvidence={() =>
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
                  formatTime={formatTime}
                  isAttention
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: UPCOMING */}
        {(filterSection === 'all' || filterSection === 'upcoming') && upcomingActions.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#f59e0b',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={14} style={{ color: '#f59e0b' }} />
              <span>UPCOMING ({upcomingActions.length})</span>
              <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  togglingId={togglingId}
                  onToggle={() => handleToggle(action.meetingId, action.id)}
                  onTitleClick={() => navigateToMeeting(action.meetingId, 'actions')}
                  onMeetingClick={() => navigateToMeeting(action.meetingId, 'summary')}
                  onEvidenceClick={() => navigateToMeeting(action.meetingId, 'transcript', action.timestamp)}
                  onInspectEvidence={() =>
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
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: COMPLETED */}
        {(filterSection === 'all' || filterSection === 'completed') && completedActions.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#34d399',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={14} style={{ color: '#34d399' }} />
              <span>COMPLETED ({completedActions.length})</span>
              <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedActions.map((action) => (
                <div
                  key={action.id}
                  style={{
                    background: '#161b22',
                    border: '1px solid #21262d',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    opacity: 0.85
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Checkbox: Uncomplete */}
                    <button
                      onClick={() => handleToggle(action.meetingId, action.id)}
                      disabled={togglingId === action.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Click to uncomplete (saves to SQLite)"
                    >
                      <CheckCircle2 size={20} style={{ color: '#34d399' }} />
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={() => navigateToMeeting(action.meetingId, 'actions')}
                        style={{
                          fontSize: '0.92rem',
                          color: '#8b949e',
                          textDecoration: 'line-through',
                          lineHeight: 1.4,
                          cursor: 'pointer'
                        }}
                      >
                        {action.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6e7681', marginTop: '3px' }}>
                        {action.meetingTitle} · {action.ownerName} · {action.dueDateLabel}
                      </div>
                    </div>

                    <button
                      onClick={() => navigateToMeeting(action.meetingId, 'actions')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6e7681',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Meeting</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ActionCardProps {
  action: any;
  togglingId: string | null;
  onToggle: () => void;
  onTitleClick: () => void;
  onMeetingClick: () => void;
  onEvidenceClick: () => void;
  onInspectEvidence?: () => void;
  formatTime: (s?: number) => string;
  isAttention?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  togglingId,
  onToggle,
  onTitleClick,
  onMeetingClick,
  onEvidenceClick,
  onInspectEvidence,
  formatTime,
  isAttention
}) => {
  return (
    <div
      style={{
        background: '#0f172a',
        border: isAttention ? '1px solid #7f1d1d' : '1px solid #1e283b',
        borderRadius: '6px',
        padding: '14px 18px',
        transition: 'all 0.15s ease'
      }}
      className="action-card-hover"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Checkbox: toggle without navigating */}
        <button
          onClick={onToggle}
          disabled={togglingId === action.id}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginTop: '2px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Click checkbox to mark completed (saves to SQLite)"
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '4px',
              border: isAttention ? '2px solid #ef4444' : '2px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          />
        </button>

        {/* Action Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Action Title: clicking opens originating meeting */}
          <div
            onClick={onTitleClick}
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#f8fafc',
              lineHeight: 1.45,
              cursor: 'pointer'
            }}
            title="Click to view originating meeting"
          >
            {action.title}
          </div>

          {/* Meeting source, owner, due date */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              marginTop: '5px',
              fontSize: '0.76rem',
              color: '#94a3b8'
            }}
          >
            <span
              onClick={onMeetingClick}
              style={{
                color: '#38bdf8',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Open meeting overview"
            >
              <Video size={12} />
              <span>{action.meetingTitle}</span>
            </span>

            <span>·</span>
            <span>Owner: <strong style={{ color: '#cbd5e1' }}>{action.ownerName}</strong></span>

            <span>·</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isAttention ? '#ef4444' : '#94a3b8',
                fontWeight: isAttention ? 600 : 400
              }}
            >
              <Clock size={12} />
              <span>{action.dueDateLabel}</span>
            </span>
          </div>

          {/* Evidence footer */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid #1e283b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {action.timestamp !== undefined ? (
                <button
                  onClick={onEvidenceClick}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Jump to spoken agreement at ${formatTime(action.timestamp)}`}
                >
                  <Play size={10} />
                  <span>▶ {formatTime(action.timestamp)}</span>
                </button>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Meeting outcome</span>
              )}

              {onInspectEvidence && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectEvidence();
                  }}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Inspect in Evidence Explorer"
                >
                  <ShieldCheck size={11} />
                  <span>Grounded</span>
                </button>
              )}
            </div>

            <button
              onClick={onTitleClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Open meeting</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
