import React, { useState } from 'react';
import { useMeeting, WORKSPACE_ACCOUNTS } from '../context/MeetingContext';
import { Sparkles, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail, showToast } = useMeeting();
  const [emailInput, setEmailInput] = useState('david@company.com');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim().toLowerCase();

    if (!clean || !clean.includes('@') || !clean.includes('.') || clean.endsWith('@') || clean.endsWith('.')) {
      setErrorMessage('Please enter a valid work email address (e.g. name@company.com).');
      return;
    }

    const matched = WORKSPACE_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === clean ||
        clean.includes(a.name.split(' ')[0].toLowerCase()) ||
        clean.includes(a.id.replace('p-', ''))
    );

    if (!matched) {
      setErrorMessage('Unrecognized corporate account. Please sign in with an authorized workspace email (e.g. david@company.com or sarah@company.com) or select a workspace member below.');
      return;
    }

    setErrorMessage(null);
    setSsoNotice(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      loginWithEmail(matched.email);
      setIsLoggingIn(false);
      onLoginSuccess();
    }, 350);
  };

  const handleProviderLogin = (provider: 'Google' | 'Microsoft') => {
    setErrorMessage(null);
    setSsoNotice(`Enterprise SSO via ${provider} requires external Identity Provider (SAML 2.0 / OIDC) configuration. Please sign in below using your authorized work email.`);
  };

  const handleSelectAccount = (email: string) => {
    setEmailInput(email);
    setErrorMessage(null);
    setSsoNotice(null);
    setIsLoggingIn(true);
    setTimeout(() => {
      loginWithEmail(email);
      setIsLoggingIn(false);
      onLoginSuccess();
    }, 250);
  };

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
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px'
          }}
        >
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
          <span style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
            Meetwise
          </span>
        </div>

        <p style={{ fontSize: '0.94rem', color: '#cbd5e1', fontWeight: 500, margin: '0 0 4px 0' }}>
          Meeting intelligence and outcome workspace
        </p>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
          Traceable commitments, decisions, and evidence from your team syncs.
        </p>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#0f172a',
          border: '1px solid #1e283b',
          borderRadius: '6px',
          padding: '24px 28px'
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 4px 0', color: '#f1f5f9' }}>
          Sign in to your workspace
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 18px 0' }}>
          Connect with your organization email or enterprise SSO.
        </p>

        {/* Error message banner */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#fca5a5',
              lineHeight: 1.45
            }}
          >
            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SSO Notice banner */}
        {ssoNotice && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#bae6fd',
              lineHeight: 1.45
            }}
          >
            <Info size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <span>{ssoNotice}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Work email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#0a0d14',
                border: errorMessage ? '1px solid #ef4444' : '1px solid #1e283b',
                borderRadius: '6px',
                padding: '0 12px',
                gap: '10px'
              }}
            >
              <Mail size={15} style={{ color: errorMessage ? '#ef4444' : '#64748b' }} />
              <input
                type="email"
                placeholder="name@company.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoggingIn}
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontSize: '0.88rem',
                  height: '40px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-primary"
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '6px',
              fontSize: '0.86rem',
              fontWeight: 600,
              background: '#2563eb',
              color: '#ffffff',
              border: '1px solid #1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.8 : 1
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Continue with work email</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0 16px 0',
            color: '#64748b',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#1e283b' }} />
          <span>Or continue with SSO</span>
          <div style={{ flex: 1, height: '1px', background: '#1e283b' }} />
        </div>

        {/* OAuth Placeholders: Google & Microsoft */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleProviderLogin('Google')}
            style={{
              width: '100%',
              height: '38px',
              background: '#0a0d14',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="btn-oauth-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleProviderLogin('Microsoft')}
            style={{
              width: '100%',
              height: '38px',
              background: '#0a0d14',
              border: '1px solid #1e283b',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            className="btn-oauth-hover"
          >
            <svg width="15" height="15" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Continue with Microsoft</span>
          </button>
        </div>

        {/* Team Members Quick Sign-in */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e283b' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Fast sign-in (Workspace members)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {WORKSPACE_ACCOUNTS.map((account) => (
              <div
                key={account.id}
                tabIndex={0}
                role="button"
                onClick={() => handleSelectAccount(account.email)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectAccount(account.email);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#0a0d14',
                  border: '1px solid #1e283b',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                className="action-card-hover"
                title={`Enter workspace as ${account.name}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <img
                    src={account.avatar}
                    alt={account.name}
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {account.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {account.email} · {account.role}
                    </div>
                  </div>
                </div>

                <ArrowRight size={12} style={{ color: '#64748b' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Small trust notice */}
        <div
          style={{
            marginTop: '18px',
            fontSize: '0.7rem',
            color: '#64748b',
            lineHeight: 1.45,
            textAlign: 'center'
          }}
        >
          Protected by enterprise SSO and localized SQLite persistence.
        </div>
      </div>
    </div>
  );
};
