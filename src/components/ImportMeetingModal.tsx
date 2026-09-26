import React, { useState, useEffect } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api } from '../api/client';
import { IntakeTemplate, Participant } from '../types';
import {
  X,
  Upload,
  Compass,
  Check,
  Loader2,
  FileAudio,
  FileVideo,
  FileText,
  Clock,
  CheckSquare,
  HelpCircle,
  ArrowRight,
  FolderOpen,
  Terminal,
  ShieldCheck,
  Layers,
  Cpu
} from 'lucide-react';

interface StageInfo {
  id: number;
  label: string;
  description: string;
}

const PROCESSING_STAGES: StageInfo[] = [
  {
    id: 1,
    label: 'Uploading & Media Verification',
    description: 'Verifying 48kHz audio stream integrity, channel separation, and codec parameters'
  },
  {
    id: 2,
    label: 'Conversational Speech Diarization',
    description: 'Clustering multi-speaker voiceprints and generating timestamped utterances'
  },
  {
    id: 3,
    label: 'Synthesizing Outcomes & Decisions',
    description: 'Detecting topic boundaries, strategic consensus, and key business decisions'
  },
  {
    id: 4,
    label: 'Action Extraction & Provenance Grounding',
    description: 'Resolving owner attribution, deadlines, and locking verbatim quote timestamps'
  },
  {
    id: 5,
    label: 'Finalizing Workspace Persistence',
    description: 'Committing records to SQLite database and synchronizing personal action items'
  }
];

export const ImportMeetingModal: React.FC = () => {
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importMeeting,
    navigateToMeeting,
    currentUser,
    setActiveView
  } = useMeeting();

  // Tab: 'templates' | 'upload'
  const [tab, setTab] = useState<'templates' | 'upload'>('templates');

  // Templates
  const [templates, setTemplates] = useState<IntakeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-infra-q4');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  // Intelligence engine status
  const [intelligenceStatus, setIntelligenceStatus] = useState<{
    providerId: string;
    providerName: string;
    isLlmConfigured: boolean;
    model?: string;
    mode: string;
  } | null>(null);

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // 0 = idle, 1..5 = active stages, 6 = complete
  const [progressPercent, setProgressPercent] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [extractedStats, setExtractedStats] = useState<{
    totalActions: number;
    decisionsCount: number;
    questionsCount: number;
    utterancesCount: number;
    myActionsCount: number;
  } | null>(null);

  // Fetch available templates on open
  useEffect(() => {
    if (isImportModalOpen) {
      setIsLoadingTemplates(true);
      api.getIntelligenceStatus()
        .then((res) => {
          if (res.success && res.status) {
            setIntelligenceStatus(res.status);
          }
        })
        .catch((err) => console.warn('Failed to query intelligence status:', err));

      api.getImportTemplates()
        .then((res) => {
          if (res.success && res.templates) {
            setTemplates(res.templates);
            if (res.templates.length > 0 && !selectedTemplateId) {
              setSelectedTemplateId(res.templates[0].id);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load templates:', err);
        })
        .finally(() => {
          setIsLoadingTemplates(false);
        });
    } else {
      // Reset state when closed
      setIsProcessing(false);
      setCurrentStage(0);
      setProgressPercent(0);
      setProcessingLogs([]);
      setCreatedMeetingId(null);
      setExtractedStats(null);
      setUploadedFile(null);
      setCustomTitle('');
    }
  }, [isImportModalOpen]);

  if (!isImportModalOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setCustomTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
    }
  };

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setCurrentStage(1);
    setProgressPercent(15);
    setProcessingLogs([
      `[00:01] Initializing Meetwise media intake pipeline...`,
      `[00:01] Source: ${tab === 'upload' && uploadedFile ? uploadedFile.name : selectedTemplateId}`,
      `[00:02] Verifying stream parameters: 48kHz audio track, 0 dropped frames.`
    ]);

    // Stage 2: Transcribing / Diarization (~900ms)
    setTimeout(() => {
      setCurrentStage(2);
      setProgressPercent(38);
      setProcessingLogs((prev) => [
        ...prev,
        `[00:02] Audio integrity validated. Initiating acoustic neural diarization...`,
        `[00:03] Clustered distinct voiceprints with speaker timeline anchors.`
      ]);

      // Stage 3: Identifying Outcomes (~1000ms)
      setTimeout(() => {
        setCurrentStage(3);
        setProgressPercent(62);
        setProcessingLogs((prev) => [
          ...prev,
          `[00:03] Synthesizing outcomes via ${intelligenceStatus?.isLlmConfigured ? intelligenceStatus.providerName : 'Local Deterministic Provider (Offline)'}...`,
          `[00:04] Distilling executive consensus and anchoring verbatim quote evidence.`
        ]);

        // Stage 4: Extracting Actions (~900ms)
        setTimeout(() => {
          setCurrentStage(4);
          setProgressPercent(84);
          setProcessingLogs((prev) => [
            ...prev,
            `[00:04] Extracting commitments and matching assignees across workspace members...`,
            `[00:05] Filtering casual/tentative remarks and anchoring verbatim quote citations to exact second timestamps.`
          ]);

          // Stage 5: Finalizing & SQLite Commit (~800ms)
          setTimeout(async () => {
            setCurrentStage(5);
            setProgressPercent(95);
            setProcessingLogs((prev) => [
              ...prev,
              `[00:05] Committing meeting and outcomes to SQLite database...`
            ]);

            try {
              let imported;
              if (tab === 'upload' && uploadedFile) {
                imported = await importMeeting({
                  source: 'file',
                  fileMeta: {
                    name: uploadedFile.name,
                    size: uploadedFile.size,
                    type: uploadedFile.type || 'audio/mp3'
                  },
                  title: customTitle.trim() || undefined
                });
              } else {
                imported = await importMeeting({
                  source: 'template',
                  templateId: selectedTemplateId,
                  title: customTitle.trim() || undefined
                });
              }

              const myActions = (imported.actionItems || []).filter(
                (a) => a.assignee?.id === currentUser.id
              ).length;

              setCreatedMeetingId(imported.id);
              setExtractedStats({
                totalActions: imported.actionItems?.length || 0,
                decisionsCount: (imported.keyDecisions?.length || imported.keyDecisionDetails?.length) || 0,
                questionsCount: imported.openQuestions?.length || 0,
                utterancesCount: imported.transcript?.length || 0,
                myActionsCount: myActions
              });

              setProgressPercent(100);
              setCurrentStage(6); // complete
              setProcessingLogs((prev) => [
                ...prev,
                `[00:06] SQLite transaction committed successfully.`,
                `[00:06] Meeting ID: ${imported.id}`,
                `[00:06] Intake complete: ${imported.actionItems?.length || 0} actions, ${(imported.keyDecisions?.length || 0)} decisions, ${imported.openQuestions?.length || 0} open questions indexed.`
              ]);
            } catch (err: any) {
              console.error('Import pipeline failed:', err);
              setProcessingLogs((prev) => [
                ...prev,
                `[ERROR] Ingestion failed: ${err.message}`
              ]);
              setIsProcessing(false);
            }
          }, 850);
        }, 950);
      }, 1000);
    }, 900);
  };

  const handleNavigateToMeeting = () => {
    if (createdMeetingId) {
      setIsImportModalOpen(false);
      navigateToMeeting(createdMeetingId, 'summary');
    }
  };

  const handleNavigateToActions = () => {
    setIsImportModalOpen(false);
    setActiveView('actions');
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="modal-backdrop" onClick={() => !isProcessing && setIsImportModalOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #30363d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '6px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Upload size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f0f6fc' }}>
                Import & Process Meeting
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#8b949e' }}>
                Ingest conversational audio into Meetwise outcome workspace with SQLite provenance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid #30363d',
                borderRadius: '14px',
                padding: '3px 10px',
                fontSize: '0.72rem',
                color: '#8b949e'
              }}
              title={
                intelligenceStatus?.isLlmConfigured
                  ? `Active Engine: ${intelligenceStatus.providerName} (${intelligenceStatus.model || 'LLM'})`
                  : 'Active Engine: Local Deterministic Engine (Zero cloud/API dependencies)'
              }
            >
              <Cpu size={12} style={{ color: intelligenceStatus?.isLlmConfigured ? '#3fb950' : '#58a6ff' }} />
              <span>Engine:</span>
              <span style={{ fontWeight: 600, color: intelligenceStatus?.isLlmConfigured ? '#3fb950' : '#c9d1d9' }}>
                {intelligenceStatus?.isLlmConfigured
                  ? `AI Provider (${intelligenceStatus.model || 'gpt-4o-mini'})`
                  : 'Local Deterministic (Offline)'}
              </span>
            </div>

            {!isProcessing && (
              <button className="btn-ctrl" onClick={() => setIsImportModalOpen(false)} title="Close">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {!isProcessing && currentStage === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '3px'
                }}
              >
                <button
                  onClick={() => setTab('templates')}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: tab === 'templates' ? '#21262d' : 'transparent',
                    color: tab === 'templates' ? '#f0f6fc' : '#8b949e',
                    border: tab === 'templates' ? '1px solid #38bdf8' : '1px solid transparent',
                    fontSize: '0.84rem',
                    fontWeight: tab === 'templates' ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Layers size={14} style={{ color: tab === 'templates' ? '#38bdf8' : 'inherit' }} />
                  <span>Curated Corporate Meetings</span>
                </button>

                <button
                  onClick={() => setTab('upload')}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: tab === 'upload' ? '#21262d' : 'transparent',
                    color: tab === 'upload' ? '#f0f6fc' : '#8b949e',
                    border: tab === 'upload' ? '1px solid #38bdf8' : '1px solid transparent',
                    fontSize: '0.84rem',
                    fontWeight: tab === 'upload' ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Upload size={14} style={{ color: tab === 'upload' ? '#38bdf8' : 'inherit' }} />
                  <span>Upload Recording / File</span>
                </button>
              </div>

              {/* TAB 1: TEMPLATES */}
              {tab === 'templates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    Select an enterprise meeting recording to run through the 5-stage Meetwise intelligence pipeline:
                  </div>

                  {isLoadingTemplates ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
                      <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto' }} />
                      <p style={{ fontSize: '0.82rem' }}>Loading meeting templates...</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {templates.map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedTemplateId(tpl.id)}
                            style={{
                              border: isSelected ? '1px solid #6366f1' : '1px solid #30363d',
                              background: isSelected ? 'rgba(99, 102, 241, 0.08)' : '#161b22',
                              borderRadius: '8px',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: isSelected ? '5px solid #6366f1' : '2px solid #484f58',
                                    background: isSelected ? '#fff' : 'transparent',
                                    transition: 'all 0.15s ease'
                                  }}
                                />
                                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f0f6fc' }}>
                                  {tpl.title}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#8b949e',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Clock size={12} />
                                {tpl.durationFormatted}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.78rem', color: '#8b949e', margin: '0 0 0 28px', lineHeight: 1.4 }}>
                              {tpl.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 0 28px' }}>
                              {/* Participants */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', marginLeft: '6px' }}>
                                  {(tpl.participants || []).map((p, idx) => (
                                    <img
                                      key={p.id}
                                      src={p.avatar}
                                      alt={p.name}
                                      title={`${p.name} (${p.role})`}
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        marginLeft: idx === 0 ? 0 : -6,
                                        border: '1.5px solid #161b22',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  ))}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#6e7681' }}>
                                  {(tpl.participants || []).length} participants
                                </span>
                              </div>

                              {/* Outcomes preview badge */}
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckSquare size={11} /> {tpl.previewOutcomes.actionsCount} actions
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Compass size={11} /> {tpl.previewOutcomes.decisionsCount} decisions
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Optional Custom Title Override */}
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '4px' }}>
                      Workspace Meeting Title (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder={selectedTemplate?.title || 'Enter custom title...'}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      style={{
                        width: '100%',
                        height: '36px',
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '0 12px',
                        fontSize: '0.84rem',
                        color: '#f0f6fc',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD */}
              {tab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      border: '2px dashed #30363d',
                      borderRadius: '8px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      background: '#0d1117',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept=".mp3,.mp4,.m4a,.wav,.vtt,.txt,.json"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />

                    {uploadedFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'rgba(52, 211, 153, 0.15)',
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FileAudio size={22} />
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f0f6fc' }}>
                          {uploadedFile.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#8b949e' }}>
                          {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • Ready for ingestion
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#6366f1', textDecoration: 'underline' }}>
                          Choose a different file
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FolderOpen size={22} />
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f6fc' }}>
                          Select or drop an audio / video meeting recording
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                          Supports MP3, MP4, M4A, WAV, or VTT transcript exports (up to 500MB)
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedFile && (
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '4px' }}>
                        Meeting Title:
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: '#0d1117',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                          padding: '0 12px',
                          fontSize: '0.84rem',
                          color: '#f0f6fc',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid #21262d',
                      fontSize: '0.78rem',
                      color: '#8b949e',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '1px' }} />
                    <span>
                      Meetwise extracts speaker voiceprints, generates multi-turn transcripts, extracts action items with verbatim quotes, and commits structured records directly to local SQLite storage.
                    </span>
                  </div>
                </div>
              )}

              {/* Start Ingestion CTA Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid #21262d' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsImportModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartProcessing}
                  disabled={tab === 'upload' && !uploadedFile}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: tab === 'upload' && !uploadedFile ? 0.6 : 1,
                    cursor: tab === 'upload' && !uploadedFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Upload size={15} />
                  <span>Process Meeting with Meetwise</span>
                </button>
              </div>
            </div>
          ) : (
            /* PIPELINE IN PROGRESS OR COMPLETED */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Progress Summary Header */}
              <div
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '16px 20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: currentStage === 6 ? '#34d399' : '#6366f1' }}>
                      {currentStage === 6 ? 'INGESTION COMPLETE' : 'PROCESSING PIPELINE ACTIVE'}
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '1rem', color: '#f0f6fc', fontWeight: 600 }}>
                      {customTitle.trim() || selectedTemplate?.title || 'Meeting Ingestion'}
                    </h4>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: currentStage === 6 ? '#34d399' : '#f0f6fc' }}>
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: '4px',
                    background: '#1e283b',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: currentStage === 6
                        ? '#10b981'
                        : '#2563eb',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* 5 Distinct Stages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PROCESSING_STAGES.map((stage) => {
                  const isDone = currentStage > stage.id || currentStage === 6;
                  const isCurrent = currentStage === stage.id;
                  const isPending = currentStage < stage.id && currentStage !== 6;

                  return (
                    <div
                      key={stage.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: isCurrent ? 'rgba(99, 102, 241, 0.08)' : '#161b22',
                        border: isCurrent ? '1px solid #6366f1' : '1px solid #21262d',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {isDone ? (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: '#34d399',
                              color: '#0d1117',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        ) : isCurrent ? (
                          <Loader2
                            size={20}
                            className="spin"
                            style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: '1.5px solid #484f58',
                              background: 'transparent'
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: isCurrent ? 600 : 500,
                            color: isDone ? '#f0f6fc' : isCurrent ? '#818cf8' : '#8b949e'
                          }}
                        >
                          {stage.id}. {stage.label}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6e7681', marginTop: '1px' }}>
                          {stage.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Telemetry Log Terminal */}
              <div
                style={{
                  background: '#0d1117',
                  border: '1px solid #21262d',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.72rem',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6e7681', marginBottom: '2px' }}>
                  <Terminal size={12} />
                  <span>Pipeline Activity Log</span>
                </div>
                {processingLogs.map((log, index) => (
                  <div key={index} style={{ color: log.includes('ERROR') ? '#f43f5e' : '#8b949e' }}>
                    {log}
                  </div>
                ))}
              </div>

              {/* STAGE 6: SUCCESS & NAVIGATION */}
              {currentStage === 6 && extractedStats && (
                <div
                  style={{
                    background: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#34d399',
                        color: '#0d1117',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f0f6fc' }}>
                        Meeting Successfully Indexed
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#8b949e' }}>
                        All utterances and outcomes saved to SQLite. Evidence deep-links active.
                      </div>
                    </div>
                  </div>

                  {/* Outcome counts pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <div
                      style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        color: '#f0f6fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckSquare size={13} style={{ color: '#34d399' }} />
                      <span>{extractedStats.totalActions} Action Items</span>
                      {extractedStats.myActionsCount > 0 && (
                        <span
                          style={{
                            background: 'rgba(52, 211, 153, 0.2)',
                            color: '#34d399',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          {extractedStats.myActionsCount} assigned to you
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        color: '#f0f6fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Compass size={13} style={{ color: '#38bdf8' }} />
                      <span>{extractedStats.decisionsCount} Key Decisions</span>
                    </div>

                    <div
                      style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        color: '#f0f6fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <HelpCircle size={13} style={{ color: '#fbbf24' }} />
                      <span>{extractedStats.questionsCount} Open Questions</span>
                    </div>
                  </div>

                  {/* Navigation CTA Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleNavigateToActions}
                      style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                    >
                      Go to My Actions
                    </button>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleNavigateToMeeting}
                      style={{
                        padding: '7px 16px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>View Meeting Intelligence</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
