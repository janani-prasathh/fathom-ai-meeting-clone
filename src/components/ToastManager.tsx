import React from 'react';
import { useMeeting } from '../context/MeetingContext';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export const ToastManager: React.FC = () => {
  const { toast, clearToast } = useMeeting();

  if (!toast) return null;

  const handleUndo = () => {
    if (toast.onUndo) {
      toast.onUndo();
    }
    clearToast();
  };

  return (
    <div className="toast-container">
      <div className="undo-toast">
        <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.message}</span>

        {toast.onUndo && (
          <button className="undo-toast-btn" onClick={handleUndo}>
            <RotateCcw size={13} style={{ marginRight: 4, display: 'inline' }} />
            <span>{toast.undoLabel || 'Undo'}</span>
          </button>
        )}

        <button
          className="btn-ctrl"
          onClick={clearToast}
          style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
