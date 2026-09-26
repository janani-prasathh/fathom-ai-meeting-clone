import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { WorkspaceView } from '../types';
import {
  Home,
  CheckSquare,
  Compass,
  HelpCircle,
  Video,
  Layers,
  ChevronRight,
  LogOut,
  UserCheck,
  Upload
} from 'lucide-react';

export const WorkspaceSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    activeMeetingId,
    setActiveMeetingId,
    meetings,
    currentUser,
    userActionStats,
    setIsAccountModalOpen,
    setIsImportModalOpen,
    logout
  } = useMeeting();

  const handleNavClick = (view: WorkspaceView) => {
    setActiveMeetingId(null);
    setActiveView(view);
  };

  const recentMeetings = meetings.slice(0, 5);

  return (
    <aside
      className="workspace-sidebar"
      style={{
        width: '260px',
        flexShrink: 0,
        background: '#0e131f',
        borderRight: '1px solid #1e283b',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '18px 18px 15px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #1e283b'
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '-0.02em'
          }}
        >
          M
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.98rem', letterSpacing: '-0.01em', color: '#f1f5f9' }}>
            Meetwise
          </div>
          <div style={{ fontSize: '0.67rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Meeting Intelligence
          </div>
        </div>
      </div>

      {/* Nav Section: WORKSPACE */}
      <div style={{ padding: '16px 12px 8px 12px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#64748b',
            padding: '0 8px 8px 8px'
          }}
        >
          WORKSPACE
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Overview */}
          <button
            onClick={() => handleNavClick('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'overview' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'overview' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'overview' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'overview' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Home size={15} style={{ color: !activeMeetingId && activeView === 'overview' ? '#3b82f6' : 'inherit' }} />
              <span>Overview</span>
            </span>
          </button>

          {/* My Actions */}
          <button
            onClick={() => handleNavClick('actions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'actions' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'actions' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'actions' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'actions' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <CheckSquare size={15} style={{ color: !activeMeetingId && activeView === 'actions' ? '#10b981' : 'inherit' }} />
              <span>My Actions</span>
            </span>
            {userActionStats.pending > 0 && (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  padding: '1px 6px'
                }}
              >
                {userActionStats.pending}
              </span>
            )}
          </button>

          {/* Decisions */}
          <button
            onClick={() => handleNavClick('decisions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'decisions' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'decisions' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'decisions' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'decisions' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Compass size={15} style={{ color: !activeMeetingId && activeView === 'decisions' ? '#38bdf8' : 'inherit' }} />
              <span>Decisions</span>
            </span>
          </button>

          {/* Open Questions */}
          <button
            onClick={() => handleNavClick('questions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'questions' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'questions' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'questions' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'questions' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <HelpCircle size={15} style={{ color: !activeMeetingId && activeView === 'questions' ? '#f59e0b' : 'inherit' }} />
              <span>Open Questions</span>
            </span>
          </button>
        </nav>
      </div>

      {/* Nav Section: MEETINGS */}
      <div style={{ padding: '8px 12px 6px 12px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#64748b',
            padding: '0 8px 8px 8px'
          }}
        >
          MEETINGS
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* My Meetings */}
          <button
            onClick={() => handleNavClick('my-meetings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'my-meetings' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'my-meetings' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'my-meetings' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'my-meetings' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Video size={15} style={{ color: !activeMeetingId && activeView === 'my-meetings' ? '#3b82f6' : 'inherit' }} />
              <span>My Meetings</span>
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: !activeMeetingId && activeView === 'my-meetings' ? '#60a5fa' : '#64748b',
                fontWeight: 600
              }}
            >
              {meetings.filter(m => (m as any).involvement?.attended || (m as any).stats?.myActionsCount > 0 || (m.participants || []).some(p => p.id === currentUser.id)).length}
            </span>
          </button>

          {/* All Meetings */}
          <button
            onClick={() => handleNavClick('meetings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              background: !activeMeetingId && activeView === 'meetings' ? '#1e293b' : 'transparent',
              color: !activeMeetingId && activeView === 'meetings' ? '#f8fafc' : '#94a3b8',
              border: !activeMeetingId && activeView === 'meetings' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: !activeMeetingId && activeView === 'meetings' ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Layers size={15} style={{ color: !activeMeetingId && activeView === 'meetings' ? '#a78bfa' : 'inherit' }} />
              <span>All Meetings</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{meetings.length}</span>
          </button>

          {/* Import Meeting Entry Point */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(37, 99, 235, 0.08)',
              color: '#93c5fd',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
              textAlign: 'left',
              marginTop: '4px',
              transition: 'all 0.15s ease'
            }}
            title="Import an audio/video meeting recording or template"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={14} style={{ color: '#60a5fa' }} />
              <span>Import Meeting</span>
            </span>
            <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 600 }}>+ Intake</span>
          </button>
        </nav>
      </div>

      {/* Nav Section: RECENT */}
      <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#64748b',
            padding: '0 8px 8px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>RECENT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {recentMeetings.map((m) => {
            const isSelected = activeMeetingId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMeetingId(m.id)}
                title={m.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: isSelected ? '#1e293b' : 'transparent',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  border: isSelected ? '1px solid #334155' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: isSelected ? '#3b82f6' : '#475569',
                    marginRight: '8px',
                    flexShrink: 0
                  }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Footer */}
      <div
        style={{
          borderTop: '1px solid #1e283b',
          padding: '12px 14px',
          background: '#0a0d14'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            onClick={() => setIsAccountModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              minWidth: 0,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              transition: 'background 0.15s ease'
            }}
            title="Click to view workspace account"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workspace member
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: '#93c5fd',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Manage workspace account"
              >
                <UserCheck size={12} />
                <span>Account</span>
              </button>

              <button
                onClick={() => logout()}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Sign out of Meetwise"
              >
                <LogOut size={11} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
