import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { X, Users, Mail, ShieldAlert, Check, UserMinus, Copy } from 'lucide-react';

export const SharingModal: React.FC = () => {
  const {
    activeMeeting,
    isShareModalOpen,
    setIsShareModalOpen,
    toggleAttendeeShare,
    shareWithEmail,
    revokeShare,
    showToast
  } = useMeeting();

  const [externalEmail, setExternalEmail] = useState('');
  const [showExternalConfirm, setShowExternalConfirm] = useState(false);

  if (!isShareModalOpen || !activeMeeting) return null;

  const attendeeEmails = activeMeeting.participants.map((p) => p.email.toLowerCase());
  const isExternal = externalEmail.trim() && !attendeeEmails.includes(externalEmail.trim().toLowerCase());

  const handleExternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = externalEmail.trim();
    if (!email) return;

    if (isExternal && !showExternalConfirm) {
      setShowExternalConfirm(true);
      return;
    }

    shareWithEmail(activeMeeting.id, email);
    setExternalEmail('');
    setShowExternalConfirm(false);
  };

  const handleCopyPublicLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast('Direct meeting link copied to clipboard!');
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <h3>Share Meeting</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeMeeting.title}
              </p>
            </div>
          </div>

          <button
            className="btn-ctrl"
            onClick={() => setIsShareModalOpen(false)}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: People in this meeting */}
          <div>
            <div className="share-section-title">People in this meeting</div>
            <div className="share-attendee-list">
              {activeMeeting.participants.map((p) => {
                const isShared = activeMeeting.shares.some(
                  (s) => s.email.toLowerCase() === p.email.toLowerCase() && !s.revoked
                );

                return (
                  <div key={p.id} className="share-attendee-row">
                    <div className="share-attendee-left">
                      <img src={p.avatar} alt={p.name} />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: isShared ? '#34d399' : 'var(--text-muted)' }}>
                        {isShared ? 'Shared' : 'Not shared'}
                      </span>
                      <div
                        className={`toggle-switch ${isShared ? 'active' : ''}`}
                        onClick={() => toggleAttendeeShare(activeMeeting.id, p.email)}
                        title={isShared ? 'Revoke share' : 'Share meeting with this attendee'}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Share with someone else */}
          <div>
            <div className="share-section-title">Share with someone else</div>
            <form onSubmit={handleExternalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="external-email-input-row">
                <input
                  type="email"
                  placeholder="Enter email address (colleague, client, partner)..."
                  value={externalEmail}
                  onChange={(e) => {
                    setExternalEmail(e.target.value);
                    setShowExternalConfirm(false);
                  }}
                  required
                />
                <button type="submit" className="btn-record-sim" style={{ padding: '0 16px', height: 40 }}>
                  <Mail size={15} />
                  <span>Send</span>
                </button>
              </div>

              {/* Security Warning Confirmation for Non-Attendees */}
              {isExternal && showExternalConfirm && (
                <div className="security-warning-box">
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                      External recipient confirmation
                    </div>
                    <div>
                      <strong>{externalEmail}</strong> was not present in this meeting. Are you sure you want to grant full access to this transcript and recording?
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="undo-toast-btn"
                        style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }}
                        onClick={() => {
                          shareWithEmail(activeMeeting.id, externalEmail.trim());
                          setExternalEmail('');
                          setShowExternalConfirm(false);
                        }}
                      >
                        Confirm & Share Link
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setShowExternalConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Section 3: Active Shares & Revocation */}
          {activeMeeting.shares.length > 0 && (
            <div>
              <div className="share-section-title">Active Access & Revocation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeMeeting.shares.map((s) => (
                  <div
                    key={s.email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500, color: '#f1f5f9' }}>{s.email}</span>
                      {s.isAttendee ? (
                        <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                          Attendee
                        </span>
                      ) : (
                        <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                          External
                        </span>
                      )}
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#f87171' }}
                      onClick={() => revokeShare(activeMeeting.id, s.email)}
                      title="Revoke access immediately"
                    >
                      <UserMinus size={12} />
                      <span>Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy link fallback */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Or copy public link with viewing rights:
            </span>
            <button className="btn-secondary" onClick={handleCopyPublicLink}>
              <Copy size={14} />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
