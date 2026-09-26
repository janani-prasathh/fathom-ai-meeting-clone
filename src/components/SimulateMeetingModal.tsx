import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Meeting, Participant } from '../types';
import { X, Video, Sparkles, Check, Loader2 } from 'lucide-react';

const simParticipants: Record<string, Participant> = {
  david: {
    id: 'p-david',
    name: 'David Kim',
    email: 'david@meetwise.internal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'VP Product',
    color: '#6366f1'
  },
  sarah: {
    id: 'p-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@meetwise.internal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Staff ML Engineer',
    color: '#ec4899'
  },
  maya: {
    id: 'p-maya',
    name: 'Maya Patel',
    email: 'maya.patel@meetwise.internal',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Lead',
    color: '#8b5cf6'
  }
};

export const SimulateMeetingModal: React.FC = () => {
  const { isSimulateModalOpen, setIsSimulateModalOpen, addSimulatedMeeting } = useMeeting();
  const [title, setTitle] = useState('Mobile Audio Transcription Latency & Edge Sync');
  const [statusStep, setStatusStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSimulateModalOpen) return null;

  const handleStartSimulation = () => {
    setIsProcessing(true);
    setStatusStep(1);

    setTimeout(() => {
      setStatusStep(2);
      setTimeout(() => {
        setStatusStep(3);
        setTimeout(() => {
          // Construct simulated new meeting
          const newMeeting: Meeting = {
            id: `sim-meeting-${Date.now()}`,
            title: title.trim() || 'Simulated Product Sync',
            originalCalendarTitle: 'Impromptu Google Meet Meeting',
            date: new Date().toISOString(),
            durationSeconds: 980, // ~16 mins
            participants: [simParticipants.david, simParticipants.maya, simParticipants.sarah],
            overview: `Technical alignment on mobile client streaming transcription. The team decided to buffer 250ms chunks over WebSockets to reduce perceived transcription latency from 4.2s to 600ms on iOS/Android devices.`,
            keyDecisions: [
              'Adopt 250ms audio frame chunking with client-side Opus compression.',
              'Implement optimistic local transcription rendering before server-side diarization lock.'
            ],
            topics: [
              {
                title: 'Mobile Audio Stream Buffering',
                timestamp: 20,
                bullets: [
                  'Maya reported user drop-offs when transcription lag exceeded 3 seconds.',
                  'Sarah confirmed 250ms chunks stay well within mobile data usage limits.'
                ]
              },
              {
                title: 'Offline Re-synchronization Protocol',
                timestamp: 340,
                bullets: [
                  'Agreed to store unprocessed voice packets in IndexedDB when mobile network is lost.'
                ]
              }
            ],
            actionItems: [
              {
                id: `act-sim-${Date.now()}-1`,
                title: 'Benchmark 250ms Opus streaming over simulated 3G network conditions',
                assignee: simParticipants.sarah,
                completed: false,
                timestamp: 120,
                sourceQuote: "I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
              },
              {
                id: `act-sim-${Date.now()}-2`,
                title: 'Deliver mobile optimistic transcript scrolling component for React Native',
                assignee: simParticipants.maya,
                completed: false,
                timestamp: 410,
                sourceQuote: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior."
              }
            ],
            highlights: [
              {
                id: `hl-sim-${Date.now()}`,
                title: 'Sub-second Latency Target Decision',
                startTime: 110,
                endTime: 190,
                speakerName: 'Sarah Chen',
                summary: 'Sarah commits to 600ms end-to-end transcription latency using 250ms chunks.',
                tag: 'Technical Architecture'
              }
            ],
            transcript: [
              {
                id: `ut-sim-1`,
                speakerId: 'p-david',
                speakerName: 'David Kim',
                speakerAvatar: simParticipants.david.avatar,
                startTime: 0,
                endTime: 20,
                text: "Thanks everyone for hopping on short notice. We need to tackle mobile transcription lag. On phones, seeing the transcript lag 4 seconds behind the speaker feels completely broken."
              },
              {
                id: `ut-sim-2`,
                speakerId: 'p-maya',
                speakerName: 'Maya Patel',
                speakerAvatar: simParticipants.maya.avatar,
                startTime: 22,
                endTime: 65,
                text: "Exactly. In our user testing, people look at the screen, don't see words appearing, and think the recording bot crashed. We need immediate visual feedback."
              },
              {
                id: `ut-sim-3`,
                speakerId: 'p-sarah',
                speakerName: 'Sarah Chen',
                speakerAvatar: simParticipants.sarah.avatar,
                startTime: 68,
                endTime: 140,
                text: "We can switch from 2-second WAV chunks to 250ms Opus streaming over WebSocket. I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
              },
              {
                id: `ut-sim-4`,
                speakerId: 'p-maya',
                speakerName: 'Maya Patel',
                speakerAvatar: simParticipants.maya.avatar,
                startTime: 390,
                endTime: 440,
                text: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior and render partial sentences smoothly."
              }
            ],
            shares: [],
            activeTemplate: 'executive',
            templates: {
              executive: {
                key: 'executive',
                name: 'Executive Summary',
                description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
                overview: 'Technical alignment on mobile client streaming transcription to reduce user drop-off.',
                sections: [
                  {
                    heading: 'Key Decisions',
                    bullets: ['Switched mobile streaming to 250ms Opus packets to achieve 600ms latency.']
                  }
                ]
              }
            },
            suggestedQuestions: [
              'What was the cause of mobile transcription lag?',
              'What audio chunk size was agreed upon?',
              'Who owns the network throttling benchmarks?'
            ],
            tags: ['Mobile', 'Latency', 'Opus', 'Streaming']
          };

          addSimulatedMeeting(newMeeting);
          setIsProcessing(false);
          setIsSimulateModalOpen(false);
          setStatusStep(0);
        }, 800);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={() => !isProcessing && setIsSimulateModalOpen(false)}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Video size={18} />
            </div>
            <div>
              <h3>Capture & Transcribe Meeting</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulate Meetwise live capture, recording, and outcome synthesis
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button className="btn-ctrl" onClick={() => setIsSimulateModalOpen(false)}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {!isProcessing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Meeting Title / Topic:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 12px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                💡 <em>This simulates Meetwise's post-meeting intelligence pipeline: capturing audio, transcribing conversational speech with speaker tags, extracting action items with quotes, and generating structured summaries.</em>
              </div>

              <button
                className="btn-record-sim"
                style={{ width: '100%', height: '42px', justifyContent: 'center', marginTop: '8px' }}
                onClick={handleStartSimulation}
              >
                <Sparkles size={16} />
                <span>Simulate Call Capture & AI Processing</span>
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {statusStep >= 1 ? (
                  statusStep > 1 ? (
                    <Check size={18} style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <Loader2 size={18} className="spin" style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                  )
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-subtle)' }} />
                )}
                <span style={{ fontSize: '0.88rem', color: statusStep >= 1 ? '#f8fafc' : 'var(--text-muted)' }}>
                  1. Connecting recording bot & capturing audio stream...
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {statusStep >= 2 ? (
                  statusStep > 2 ? (
                    <Check size={18} style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <Loader2 size={18} className="spin" style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                  )
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-subtle)' }} />
                )}
                <span style={{ fontSize: '0.88rem', color: statusStep >= 2 ? '#f8fafc' : 'var(--text-muted)' }}>
                  2. Transcribing conversational speech with speaker diarization...
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {statusStep >= 3 ? (
                  <Check size={18} style={{ color: 'var(--accent-success)' }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-subtle)' }} />
                )}
                <span style={{ fontSize: '0.88rem', color: statusStep >= 3 ? '#f8fafc' : 'var(--text-muted)' }}>
                  3. Synthesizing executive summary, decisions & action items...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
