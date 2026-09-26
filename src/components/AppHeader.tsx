import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { Search, Video, ArrowLeft, UserCheck, Upload, Cpu, Sparkles } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    activeMeetingId,
    setActiveMeetingId,
    activeView,
    setIsGlobalSearchOpen,
    setIsSimulateModalOpen,
    setIsImportModalOpen,
    setIsAccountModalOpen,
    currentUser,
    meetings
  } = useMeeting();

  const [intelligenceStatus, setIntelligenceStatus] = useState<{
    providerId: string;
    providerName: string;
    isLlmConfigured: boolean;
    model?: string;
    mode: string;
  } | null>(null);

  useEffect(() => {
    api.getIntelligenceStatus()
      .then((res) => {
        if (res.success && res.status) {
          setIntelligenceStatus(res.status);
        }
      })
      .catch((err) => console.warn('Failed to query intelligence status:', err));
  }, []);

  const getViewTitle = () => {
    if (activeMeetingId) {
      const current = meetings.find((m) => m.id === activeMeetingId);
      return current ? current.title : 'Meeting Intelligence';
    }
    switch (activeView) {
      case 'actions':
        return 'My Actions';
      case 'decisions':
        return 'Decisions';
      case 'questions':
        return 'Open Questions';
      case 'my-meetings':
        return 'My Meetings';
      case 'meetings':
        return 'All Meetings';
      case 'overview':
      default:
        return 'Overview';
    }
  };

  return (
    <header
      className="top-nav"
      style={{
        height: '52px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1e283b',
        background: '#0f172a',
        zIndex: 50,
        gap: '16px'
      }}
    >
      {/* Left: Context / Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
        {activeMeetingId ? (
          <button
            onClick={() => setActiveMeetingId(null)}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={13} />
            <span>Workspace</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Workspace</span>
            <span style={{ color: '#334155' }}>/</span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
              {getViewTitle()}
            </span>
          </div>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div style={{ flex: 1, maxWidth: '480px' }}>
        <button
          className="global-search-trigger"
          onClick={() => setIsGlobalSearchOpen(true)}
          title="Search all meetings, decisions, actions, and evidence (Cmd+K)"
          style={{
            width: '100%',
            height: '34px',
            background: '#0a0d14',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'border-color 0.15s ease'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={13} style={{ color: '#64748b' }} />
            <span>Search transcripts, actions, decisions...</span>
          </span>
          <kbd
            style={{
              background: '#1e283b',
              border: '1px solid #334155',
              borderRadius: '3px',
              padding: '1px 5px',
              fontSize: '0.68rem',
              color: '#94a3b8'
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & User pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Intelligence Status Indicator */}
        <div
          id="intelligence-provider-status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0a0d14',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            padding: '3px 9px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            userSelect: 'none'
          }}
          title={
            intelligenceStatus?.isLlmConfigured
              ? `AI Provider Active: ${intelligenceStatus.providerName} (${intelligenceStatus.model || 'OpenAI'})`
              : `Local Deterministic Provider Active: ${intelligenceStatus?.providerName || 'Rule-based Heuristic'}`
          }
        >
          <span style={{ color: '#64748b', fontWeight: 500 }}>Engine:</span>
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: intelligenceStatus?.isLlmConfigured ? '#10b981' : '#38bdf8'
            }}
          />
          <span
            style={{
              fontWeight: 500,
              color: intelligenceStatus?.isLlmConfigured ? '#34d399' : '#cbd5e1'
            }}
          >
            {intelligenceStatus?.isLlmConfigured ? 'AI Provider' : 'Local'}
          </span>
        </div>

        <button
          className="btn-record-sim"
          onClick={() => setIsImportModalOpen(true)}
          style={{
            padding: '4px 12px',
            fontSize: '0.8rem',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
          title="Import or process a meeting recording"
        >
          <Upload size={13} />
          <span>Import Meeting</span>
        </button>

        <button
          onClick={() => setIsAccountModalOpen(true)}
          style={{
            background: '#0a0d14',
            border: '1px solid #1e283b',
            borderRadius: '6px',
            padding: '3px 8px 3px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Manage workspace account"
        >
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.76rem', fontWeight: 500, color: '#f1f5f9' }}>
            {currentUser?.name}
          </span>
          <UserCheck size={12} style={{ color: '#64748b' }} />
        </button>
      </div>
    </header>
  );
};
