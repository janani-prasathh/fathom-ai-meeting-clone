import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { MediaPlayer } from '../components/MediaPlayer';
import { SummaryViewer } from '../components/SummaryViewer';
import { ActionItemsList } from '../components/ActionItemsList';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { AskFathomChat } from '../components/AskFathomChat';
import { HighlightsViewer } from '../components/HighlightsViewer';
import { ArrowLeft, Share2, Calendar, Clock, Sparkles, CheckSquare, MessageSquare, Scissors, FileText } from 'lucide-react';

export const MeetingDetailPage: React.FC = () => {
  const {
    activeMeeting,
    setActiveMeetingId,
    setIsShareModalOpen,
    updateMeetingTitle
  } = useMeeting();

  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'transcript' | 'ask' | 'highlights'>('summary');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(activeMeeting?.title || '');

  if (!activeMeeting) return null;

  const formattedDate = new Date(activeMeeting.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const durationMin = Math.round(activeMeeting.durationSeconds / 60);
  const completedActions = activeMeeting.actionItems.filter((a) => a.completed).length;

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
            className="btn-share-modal"
            onClick={() => setIsShareModalOpen(true)}
            title="Share meeting with attendees or colleagues"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="detail-workspace">
        {/* Left Pane: Media Player */}
        <MediaPlayer />

        {/* Right Pane: Intelligence Workspace */}
        <div className="intel-pane">
          {/* Tabs Header */}
          <div className="intel-tabs-bar">
            <button
              className={`intel-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <FileText size={15} />
              <span>Summary</span>
            </button>

            <button
              className={`intel-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <CheckSquare size={15} />
              <span>Action Items</span>
              <span className="tab-badge">
                {completedActions}/{activeMeeting.actionItems.length}
              </span>
            </button>

            <button
              className={`intel-tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
              onClick={() => setActiveTab('transcript')}
            >
              <MessageSquare size={15} />
              <span>Transcript</span>
              <span className="tab-badge">{activeMeeting.transcript.length}</span>
            </button>

            <button
              className={`intel-tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveTab('ask')}
            >
              <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
              <span>Ask Fathom</span>
            </button>

            <button
              className={`intel-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
              onClick={() => setActiveTab('highlights')}
            >
              <Scissors size={15} />
              <span>Highlights</span>
              <span className="tab-badge">{activeMeeting.highlights.length}</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="intel-body-scroll">
            {activeTab === 'summary' && <SummaryViewer />}
            {activeTab === 'actions' && (
              <ActionItemsList onOpenTranscript={() => setActiveTab('transcript')} />
            )}
            {activeTab === 'transcript' && <TranscriptViewer />}
            {activeTab === 'ask' && <AskFathomChat />}
            {activeTab === 'highlights' && <HighlightsViewer />}
          </div>
        </div>
      </div>
    </div>
  );
};
