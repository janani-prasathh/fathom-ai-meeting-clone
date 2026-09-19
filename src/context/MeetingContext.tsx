import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Meeting, ShareRecipient } from '../types';
import { seedMeetings } from '../data/seedMeetings';

interface ToastState {
  id: string;
  message: string;
  onUndo?: () => void;
  undoLabel?: string;
}

interface MeetingContextType {
  meetings: Meeting[];
  activeMeetingId: string | null;
  activeMeeting: Meeting | null;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  activeUtteranceId: string | null;
  isGlobalSearchOpen: boolean;
  isShareModalOpen: boolean;
  isSimulateModalOpen: boolean;
  toast: ToastState | null;
  
  // Actions
  setActiveMeetingId: (id: string | null) => void;
  seekTo: (seconds: number, autoPlay?: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  updateMeetingTitle: (meetingId: string, newTitle: string) => void;
  toggleActionItem: (meetingId: string, actionId: string) => void;
  setMeetingTemplate: (meetingId: string, templateKey: string) => void;
  toggleAttendeeShare: (meetingId: string, email: string) => void;
  shareWithEmail: (meetingId: string, email: string) => void;
  revokeShare: (meetingId: string, email: string) => void;
  setIsGlobalSearchOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsSimulateModalOpen: (open: boolean) => void;
  showToast: (message: string, onUndo?: () => void, undoLabel?: string) => void;
  clearToast: () => void;
  addSimulatedMeeting: (newMeeting: Meeting) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

const STORAGE_KEY = 'fathom_clone_meetings_v1';

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((m: Meeting) => {
          const seed = seedMeetings.find((s) => s.id === m.id);
          if (seed) {
            return {
              ...m,
              keyDecisionDetails: m.keyDecisionDetails || seed.keyDecisionDetails,
              openQuestions: m.openQuestions || seed.openQuestions
            };
          }
          return m;
        });
        // Append any seed meetings added to codebase not yet in cache
        const missingSeeds = seedMeetings.filter((s) => !mapped.some((m: Meeting) => m.id === s.id));
        return [...mapped, ...missingSeeds];
      } catch (e) {
        console.error('Failed to parse cached meetings', e);
      }
    }
    return seedMeetings;
  });

  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync meetings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  }, [meetings]);

  // Current active meeting
  const activeMeeting = useMemo(() => {
    if (!activeMeetingId) return null;
    return meetings.find((m) => m.id === activeMeetingId) || null;
  }, [meetings, activeMeetingId]);

  // Determine active utterance based on current time
  const activeUtteranceId = useMemo(() => {
    if (!activeMeeting) return null;
    const match = activeMeeting.transcript.find(
      (u) => currentTime >= u.startTime && currentTime <= u.endTime
    );
    return match ? match.id : null;
  }, [activeMeeting, currentTime]);

  const seekTo = (seconds: number, autoPlay: boolean = true) => {
    setCurrentTime(Math.max(0, seconds));
    if (autoPlay) {
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const showToast = (message: string, onUndo?: () => void, undoLabel = 'Undo (5s)') => {
    const id = Date.now().toString();
    setToast({ id, message, onUndo, undoLabel });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 5000);
  };

  const clearToast = () => setToast(null);

  const updateMeetingTitle = (meetingId: string, newTitle: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, title: newTitle } : m))
    );
  };

  const toggleActionItem = (meetingId: string, actionId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map((act) =>
            act.id === actionId ? { ...act, completed: !act.completed } : act
          )
        };
      })
    );
  };

  const setMeetingTemplate = (meetingId: string, templateKey: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, activeTemplate: templateKey } : m))
    );
  };

  const toggleAttendeeShare = (meetingId: string, email: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const existing = m.shares.find((s) => s.email.toLowerCase() === email.toLowerCase());
        let updatedShares: ShareRecipient[];
        if (existing) {
          updatedShares = m.shares.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
        } else {
          const participant = m.participants.find((p) => p.email.toLowerCase() === email.toLowerCase());
          updatedShares = [
            ...m.shares,
            {
              email,
              name: participant?.name,
              avatar: participant?.avatar,
              isAttendee: true,
              sharedAt: new Date().toISOString(),
              revoked: false
            }
          ];
        }
        return { ...m, shares: updatedShares };
      })
    );
  };

  const shareWithEmail = (meetingId: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    let previousShares: ShareRecipient[] = [];

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        previousShares = [...m.shares];
        const participant = m.participants.find((p) => p.email.toLowerCase() === cleanEmail);
        const alreadyShared = m.shares.some((s) => s.email.toLowerCase() === cleanEmail);
        if (alreadyShared) return m;

        return {
          ...m,
          shares: [
            ...m.shares,
            {
              email: cleanEmail,
              name: participant?.name || cleanEmail.split('@')[0],
              avatar: participant?.avatar,
              isAttendee: Boolean(participant),
              sharedAt: new Date().toISOString(),
              revoked: false
            }
          ]
        };
      })
    );

    // Provide 5s Undo Toast
    showToast(`Access link sent to ${cleanEmail}`, () => {
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, shares: previousShares } : m))
      );
    });
  };

  const revokeShare = (meetingId: string, email: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          shares: m.shares.filter((s) => s.email.toLowerCase() !== email.toLowerCase())
        };
      })
    );
    showToast(`Access revoked for ${email}`);
  };

  const addSimulatedMeeting = (newMeeting: Meeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
    setActiveMeetingId(newMeeting.id);
    showToast(`Captured "${newMeeting.title}" with AI summary & action items!`);
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        activeMeetingId,
        activeMeeting,
        currentTime,
        isPlaying,
        playbackRate,
        activeUtteranceId,
        isGlobalSearchOpen,
        isShareModalOpen,
        isSimulateModalOpen,
        toast,
        setActiveMeetingId,
        seekTo,
        setIsPlaying,
        togglePlayPause,
        setPlaybackRate,
        updateMeetingTitle,
        toggleActionItem,
        setMeetingTemplate,
        toggleAttendeeShare,
        shareWithEmail,
        revokeShare,
        setIsGlobalSearchOpen,
        setIsShareModalOpen,
        setIsSimulateModalOpen,
        showToast,
        clearToast,
        addSimulatedMeeting
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
