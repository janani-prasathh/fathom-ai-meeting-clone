import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import {
  Calendar,
  Sparkles,
  CheckSquare,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { currentUser } = useMeeting();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Calendar connection states
  const [googleConnected, setGoogleConnected] = useState(true);
  const [outlookConnected, setOutlookConnected] = useState(false);

  // Step 2: Surface preferences
  const [prefActions, setPrefActions] = useState(true);
  const [prefDecisions, setPrefDecisions] = useState(true);
  const [prefQuestions, setPrefQuestions] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#0a0d14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        color: '#f1f5f9',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '-0.02em'
            }}
          >
            M
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
            Meetwise
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
          Welcome, {currentUser.name} · Workspace Setup
        </p>
      </div>

      {/* Onboarding Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0f172a',
          border: '1px solid #1e283b',
          borderRadius: '6px',
          padding: '28px 32px'
        }}
      >
        {/* Progress Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: currentStep >= 1 ? '#6366f1' : '#21262d',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              1
            </span>
            <span style={{ fontSize: '0.76rem', color: currentStep === 1 ? '#f0f6fc' : '#8b949e', fontWeight: currentStep === 1 ? 600 : 400 }}>
              Calendar
            </span>
          </div>

          <div style={{ flex: 1, height: '1px', background: '#21262d', margin: '0 10px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: currentStep >= 2 ? '#6366f1' : '#21262d',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              2
            </span>
            <span style={{ fontSize: '0.76rem', color: currentStep === 2 ? '#f0f6fc' : '#8b949e', fontWeight: currentStep === 2 ? 600 : 400 }}>
              Preferences
            </span>
          </div>

          <div style={{ flex: 1, height: '1px', background: '#21262d', margin: '0 10px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: currentStep >= 3 ? '#34d399' : '#21262d',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              3
            </span>
            <span style={{ fontSize: '0.76rem', color: currentStep === 3 ? '#34d399' : '#8b949e', fontWeight: currentStep === 3 ? 600 : 400 }}>
              Ready
            </span>
          </div>
        </div>

        {/* STEP 1: Connect your calendar */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f0f6fc', margin: '0 0 6px 0' }}>
              Connect your calendar
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#8b949e', lineHeight: 1.45, margin: '0 0 20px 0' }}>
              Meetwise connects to your scheduled discussions to extract verified decisions, action items, and discussion transcripts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {/* Google Calendar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#1c2128',
                  border: googleConnected ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #30363d'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={18} style={{ color: '#4285F4' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f6fc' }}>
                      Google Calendar
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#8b949e' }}>
                      {googleConnected ? 'Work sync enabled' : 'Not connected'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGoogleConnected(!googleConnected)}
                  style={{
                    background: googleConnected ? 'rgba(52, 211, 153, 0.15)' : '#21262d',
                    color: googleConnected ? '#34d399' : '#c9d1d9',
                    border: googleConnected ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {googleConnected && <Check size={12} />}
                  <span>{googleConnected ? 'Connected' : 'Connect'}</span>
                </button>
              </div>

              {/* Microsoft Outlook */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#1c2128',
                  border: outlookConnected ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #30363d'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={18} style={{ color: '#0078D4' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f6fc' }}>
                      Microsoft Outlook
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#8b949e' }}>
                      {outlookConnected ? 'Work sync enabled' : 'Enterprise calendar'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOutlookConnected(!outlookConnected)}
                  style={{
                    background: outlookConnected ? 'rgba(52, 211, 153, 0.15)' : '#21262d',
                    color: outlookConnected ? '#34d399' : '#c9d1d9',
                    border: outlookConnected ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {outlookConnected && <Check size={12} />}
                  <span>{outlookConnected ? 'Connected' : 'Connect'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="btn-primary"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid #1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: Choose what Meetwise should surface */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f0f6fc', margin: '0 0 6px 0' }}>
              Choose what Meetwise should surface
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#8b949e', lineHeight: 1.45, margin: '0 0 20px 0' }}>
              Configure the outcome types that will appear in your personal work cockpit:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#1c2128',
                  border: prefActions ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid #30363d',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={prefActions}
                  onChange={(e) => setPrefActions(e.target.checked)}
                  style={{ accentColor: '#34d399', width: 16, height: 16, marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#34d399' }}>
                    My action items & follow-throughs
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#8b949e', marginTop: '2px' }}>
                    Surface what you owe across all meetings with direct completion and evidence links.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#1c2128',
                  border: prefDecisions ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #30363d',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={prefDecisions}
                  onChange={(e) => setPrefDecisions(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: 16, height: 16, marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#38bdf8' }}>
                    Decisions affecting me
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#8b949e', marginTop: '2px' }}>
                    Track agreements and architectural consensus reached in your syncs.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#1c2128',
                  border: prefQuestions ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid #30363d',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={prefQuestions}
                  onChange={(e) => setPrefQuestions(e.target.checked)}
                  style={{ accentColor: '#fbbf24', width: 16, height: 16, marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fbbf24' }}>
                    Unresolved open questions
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#8b949e', marginTop: '2px' }}>
                    Stay aware of unanswered topics and blocker inquiries from recent discussions.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
                style={{ padding: '0 16px', height: '40px', fontSize: '0.86rem' }}
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: '1px solid #1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: You're ready */}
        {currentStep === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle2 size={28} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f6fc', margin: '0 0 8px 0' }}>
              You're ready, {currentUser.name.split(' ')[0]}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Meetwise will turn your meetings into work you can actually act on. Your workspace is configured to surface your commitments, consensus, and verified spoken evidence.
            </p>

            <button
              onClick={onComplete}
              className="btn-primary"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '6px',
                fontSize: '0.92rem',
                fontWeight: 600,
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid #1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Go to my workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
