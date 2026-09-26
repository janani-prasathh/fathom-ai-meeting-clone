import React from 'react';
import { useMeeting, WORKSPACE_ACCOUNTS } from '../context/MeetingContext';
import { Participant } from '../types';
import { X, User, Check, LogOut, ShieldCheck, Mail } from 'lucide-react';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, logout, showToast } = useMeeting();

  if (!isOpen) return null;

  const handleSelectAccount = (user: Participant) => {
    setCurrentUser(user);
    onClose();
    showToast(`Active account set to ${user.name}`);
  };

  const handleSignOut = () => {
    onClose();
    logout();
    showToast('Signed out of Meetwise workspace');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: '460px',
          width: '90vw',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d1117'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: '#6366f1' }} />
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f6fc', margin: 0 }}>
                Workspace Account
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: '1px' }}>
                Active profile and organization identity
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b949e', marginBottom: '10px' }}>
              Switch Workspace Member
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {WORKSPACE_ACCOUNTS.map((user) => {
                const isSelected = user.id === currentUser?.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectAccount(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : '#1c2128',
                      border: isSelected ? '1px solid #6366f1' : '1px solid #30363d',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="action-card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f6fc' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#8b949e' }}>
                          {user.role} · <span style={{ color: '#818cf8' }}>{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#34d399',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        <Check size={14} />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sign Out Button */}
          <div style={{ borderTop: '1px solid #21262d', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#f43f5e',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={14} />
              <span>Sign out of workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
