import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { MediaPlayer } from '../components/MediaPlayer';
import { SummaryViewer } from '../components/SummaryViewer';
import { ActionItemsList } from '../components/ActionItemsList';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { AskMeetwiseChat } from '../components/AskMeetwiseChat';
import { HighlightsViewer } from '../components/HighlightsViewer';
import { FollowUpEmailModal } from '../components/FollowUpEmailModal';
import { MeetingDetailSkeleton } from '../components/SkeletonLoaders';
import { ArrowLeft, Share2, Calendar, Clock, CheckSquare, MessageSquare, Scissors, FileText, Mail, Loader2, HelpCircle } from 'lucide-react';

export const MeetingDetailPage: React.FC = () => {
  const {
    activeMeeting,
    setActiveMeetingId,
    setIsShareModalOpen,
    updateMeetingTitle,
    isLoadingDetail,
    activeDetailTab,
    setActiveDetailTab,
    currentUser
  } = useMeeting();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(activeMeeting?.title || '');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!activeMeeting) {
    return (
      <div className="meeting-detail-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <button className="btn-secondary" onClick={() => setActiveMeetingId(null)}>
          <ArrowLeft size={16} style={{ marginRight: 6, display: 'inline' }} />
          Back to Meetings
        </button>
        <p style={{ color: 'var(--text-muted)' }}>Meeting not found.</p>
      </div>
    );
  }

  if (isLoadingDetail && (!activeMeeting.transcript || activeMeeting.transcript.length === 0)) {
    return (
      <div className="meeting-detail-view">
        <MeetingDetailSkeleton />
      </div>
    );
  }

  const actionItems = activeMeeting.actionItems || [];
  const transcript = activeMeeting.transcript || [];
  const highlights = activeMeeting.highlights || [];

  const formattedDate = new Date(activeMeeting.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const durationMin = Math.round((activeMeeting.durationSeconds || 0) / 60);
  const completedActions = actionItems.filter((a) => a.completed).length;

  const myActions = actionItems.filter((a) => a.assignee?.id === currentUser?.id);
  const attended = (activeMeeting.participants || []).some((p) => p.id === currentUser?.id);
  const spokeCount = transcript.filter(
    (u) => u.speakerId === currentUser?.id || (currentUser?.name && u.speakerName?.toLowerCase().includes(currentUser.name.toLowerCase()))
  ).length;

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleInput.trim() && titleInput !== activeMeeting.title) {
      updateMeetingTitle(activeMeeting.id, titleInput.trim());
    }
  };

  return (
    <div className="meeting-detail-view">
      {/* Detail Top Bar */}
      <header className="detail-header">
        <div className="detail-title-block">
          <button
            className="btn-back"
            onClick={() => setActiveMeetingId(null)}
            title="Back to all meetings"
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ minWidth: 0 }}>
            <input
              type="text"
              className="detail-title-input"
              value={editingTitle ? titleInput : activeMeeting.title}
              onFocus={() => {
                setEditingTitle(true);
                setTitleInput(activeMeeting.title);
              }}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur();
              }}
              title="Click to rename meeting"
            />

            <div className="detail-meta-row">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                {formattedDate}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                {durationMin} mins
              </span>
              {activeMeeting.originalCalendarTitle && activeMeeting.originalCalendarTitle !== activeMeeting.title && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Calendar: {activeMeeting.originalCalendarTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="detail-actions-right">
          <button
            className="btn-secondary"
            onClick={() => setIsEmailModalOpen(true)}
            title="Generate follow-up email from meeting intelligence"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={14} />
            <span>Follow-up Email</span>
          </button>

          <button
            className="btn-share-modal"
            onClick={() => setIsShareModalOpen(true)}
            title="Share meeting with attendees or colleagues"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* User Context Banner: Your involvement */}
      {(myActions.length > 0 || attended || spokeCount > 0) && (
        <div
          style={{
            background: 'rgba(37, 99, 235, 0.05)',
            borderBottom: '1px solid #1e283b',
            padding: '7px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Your involvement:</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>
              {myActions.length} action{myActions.length !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#475569' }}>·</span>
            <span style={{ color: '#38bdf8', fontWeight: 500 }}>
              {activeMeeting.keyDecisions?.length || activeMeeting.keyDecisionDetails?.length || 0} decision{(activeMeeting.keyDecisions?.length || activeMeeting.keyDecisionDetails?.length || 0) !== 1 ? 's' : ''}
            </span>
            {attended && (
              <>
                <span style={{ color: '#475569' }}>·</span>
                <span style={{ color: '#93c5fd', fontWeight: 500 }}>attended</span>
              </>
            )}
          </div>

          <div style={{ color: '#64748b', fontSize: '0.74rem' }}>
            Originating discussion for your assigned actions and team agreements.
          </div>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="detail-workspace">
        {/* Left Pane: Media Player */}
        <MediaPlayer />

        {/* Right Pane: Intelligence Workspace */}
        <div className="intel-pane">
          {/* Tabs Header */}
          <div className="intel-tabs-bar">
            <button
              className={`intel-tab-btn ${activeDetailTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveDetailTab('summary')}
            >
              <FileText size={15} />
              <span>Summary</span>
            </button>

            <button
              className={`intel-tab-btn ${activeDetailTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveDetailTab('actions')}
            >
              <CheckSquare size={15} />
              <span>Action Items</span>
              <span className="tab-badge">
                {completedActions}/{actionItems.length}
              </span>
            </button>

            <button
              className={`intel-tab-btn ${activeDetailTab === 'transcript' ? 'active' : ''}`}
              onClick={() => setActiveDetailTab('transcript')}
            >
              <MessageSquare size={15} />
              <span>Transcript</span>
              <span className="tab-badge">{transcript.length}</span>
            </button>

            <button
              className={`intel-tab-btn ${activeDetailTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveDetailTab('ask')}
            >
              <HelpCircle size={15} />
              <span>Ask Meetwise</span>
            </button>

            <button
              className={`intel-tab-btn ${activeDetailTab === 'highlights' ? 'active' : ''}`}
              onClick={() => setActiveDetailTab('highlights')}
            >
              <Scissors size={15} />
              <span>Highlights</span>
              <span className="tab-badge">{highlights.length}</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="intel-body-scroll">
            {activeDetailTab === 'summary' && <SummaryViewer />}
            {activeDetailTab === 'actions' && (
              <ActionItemsList onOpenTranscript={() => setActiveDetailTab('transcript')} />
            )}
            {activeDetailTab === 'transcript' && <TranscriptViewer />}
            {activeDetailTab === 'ask' && <AskMeetwiseChat />}
            {activeDetailTab === 'highlights' && <HighlightsViewer />}
          </div>
        </div>
      </div>

      {/* Follow-up Email Modal */}
      <FollowUpEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        meeting={activeMeeting}
      />
    </div>
  );
};
