import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Meeting, ShareRecipient, Participant, WorkspaceView, UserActionItem, EvidenceItem } from '../types.ts';
import { api, ApiError } from '../api/client.ts';

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
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  toast: ToastState | null;

  // Evidence Explorer
  evidenceExplorerItem: EvidenceItem | null;
  openEvidenceExplorer: (item: EvidenceItem) => void;
  closeEvidenceExplorer: () => void;

  // Workspace Navigation & Views
  activeView: WorkspaceView;
  setActiveView: (view: WorkspaceView) => void;

  // Authentication & Onboarding
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;

  // Current authenticated user context
  currentUser: Participant;
  setCurrentUser: (user: Participant) => void;

  // Personalized user actions (My Actions)
  userActions: UserActionItem[];
  userActionStats: { total: number; pending: number; completed: number; dueSoon: number };
  isLoadingActions: boolean;
  reloadUserActions: () => Promise<void>;

  // Personalized user meetings (My Meetings)
  userMeetings: Meeting[];
  isLoadingUserMeetings: boolean;
  reloadUserMeetings: () => Promise<void>;

  // Active detail view tab
  activeDetailTab: 'summary' | 'actions' | 'transcript' | 'ask' | 'highlights';
  setActiveDetailTab: (tab: 'summary' | 'actions' | 'transcript' | 'ask' | 'highlights') => void;
  navigateToMeeting: (
    meetingId: string,
    tab?: 'summary' | 'actions' | 'transcript' | 'ask' | 'highlights',
    timestamp?: number
  ) => void;

  // Real API state
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  reloadMeetings: () => Promise<void>;

  // Actions
  setActiveMeetingId: (id: string | null) => void;
  seekTo: (seconds: number, autoPlay?: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  updateMeetingTitle: (meetingId: string, newTitle: string) => Promise<void>;
  toggleActionItem: (meetingId: string, actionId: string) => Promise<void>;
  setMeetingTemplate: (meetingId: string, templateKey: string) => Promise<void>;
  toggleAttendeeShare: (meetingId: string, email: string) => void;
  shareWithEmail: (meetingId: string, email: string) => void;
  revokeShare: (meetingId: string, email: string) => void;
  setIsGlobalSearchOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsSimulateModalOpen: (open: boolean) => void;
  showToast: (message: string, onUndo?: () => void, undoLabel?: string) => void;
  clearToast: () => void;
  addSimulatedMeeting: (newMeeting: Meeting) => Promise<void>;
  importMeeting: (payload: {
    source: 'template' | 'file';
    templateId?: string;
    fileMeta?: any;
    title?: string;
    participantIds?: string[];
  }) => Promise<Meeting>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const DEFAULT_CURRENT_USER: Participant = {
  id: 'p-david',
  name: 'David Kim',
  username: 'david.kim',
  email: 'david@company.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'Engineering Lead',
  color: '#6366f1'
};

export const WORKSPACE_ACCOUNTS: Participant[] = [
  {
    id: 'p-david',
    name: 'David Kim',
    username: 'david.kim',
    email: 'david@company.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Engineering Lead',
    color: '#6366f1'
  },
  {
    id: 'p-sarah',
    name: 'Sarah Chen',
    username: 'sarah.chen',
    email: 'sarah@company.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    role: 'Staff ML Engineer',
    color: '#ec4899'
  },
  {
    id: 'p-elena',
    name: 'Elena Rostova',
    username: 'elena.rostova',
    email: 'elena@company.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'Head of QA & Evals',
    color: '#10b981'
  },
  {
    id: 'p-marcus',
    name: 'Marcus Vance',
    username: 'marcus.vance',
    email: 'marcus@company.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Principal Designer',
    color: '#f59e0b'
  },
  {
    id: 'p-maya',
    name: 'Maya Patel',
    username: 'maya.patel',
    email: 'maya@company.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'Frontend Lead',
    color: '#8b5cf6'
  }
];

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication & Onboarding
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.location.search.includes('bypass_auth')
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.location.search.includes('bypass_auth')
  );
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<Participant>(DEFAULT_CURRENT_USER);
  const [activeView, setActiveView] = useState<WorkspaceView>('overview');

  const loginWithEmail = useCallback((email: string) => {
    const clean = email.trim().toLowerCase();
    const matched = WORKSPACE_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === clean ||
        clean.includes(a.name.split(' ')[0].toLowerCase()) ||
        clean.includes(a.id.replace('p-', ''))
    );

    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      return true;
    }

    const customUser: Participant = {
      id: `p-custom-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      username: email.split('@')[0],
      email: clean,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'Team Member',
      color: '#6366f1'
    };
    setCurrentUser(customUser);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
  }, []);

  const [userActions, setUserActions] = useState<UserActionItem[]>([]);
  const [userActionStats, setUserActionStats] = useState({ total: 0, pending: 0, completed: 0, dueSoon: 0 });
  const [isLoadingActions, setIsLoadingActions] = useState<boolean>(false);

  const [userMeetings, setUserMeetings] = useState<Meeting[]>([]);
  const [isLoadingUserMeetings, setIsLoadingUserMeetings] = useState<boolean>(false);

  const [activeDetailTab, setActiveDetailTab] = useState<'summary' | 'actions' | 'transcript' | 'ask' | 'highlights'>('summary');
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const isSimulateModalOpen = isImportModalOpen;
  const setIsSimulateModalOpen = setIsImportModalOpen;
  const [toast, setToast] = useState<ToastState | null>(null);

  // Evidence Explorer State
  const [evidenceExplorerItem, setEvidenceExplorerItem] = useState<EvidenceItem | null>(null);

  const openEvidenceExplorer = useCallback((item: EvidenceItem) => {
    setEvidenceExplorerItem(item);
  }, []);

  const closeEvidenceExplorer = useCallback(() => {
    setEvidenceExplorerItem(null);
  }, []);

  // Load user actions from SQLite
  const loadUserActions = useCallback(async () => {
    setIsLoadingActions(true);
    try {
      const res = await api.getUserActions(currentUser.id);
      setUserActions(res.actionItems);
      setUserActionStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load user actions:', err);
    } finally {
      setIsLoadingActions(false);
    }
  }, [currentUser.id]);

  // Load user meetings from SQLite
  const loadUserMeetings = useCallback(async () => {
    setIsLoadingUserMeetings(true);
    try {
      const res = await api.getUserMeetings(currentUser.id);
      setUserMeetings(res.meetings);
    } catch (err: any) {
      console.error('Failed to load user meetings:', err);
    } finally {
      setIsLoadingUserMeetings(false);
    }
  }, [currentUser.id]);

  // Reload personalized data whenever currentUser changes
  useEffect(() => {
    loadUserActions();
    loadUserMeetings();
  }, [loadUserActions, loadUserMeetings]);

  // Load meetings from real SQLite API
  const loadMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getMeetings();
      setMeetings(res.meetings);
    } catch (err: any) {
      console.error('Failed to load meetings from API:', err);
      const msg = err instanceof ApiError ? `${err.message} (${err.status})` : err.message || 'Cannot reach API server';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // When activeMeetingId is chosen, fetch full meeting details if transcript not present or to ensure freshness
  useEffect(() => {
    if (!activeMeetingId) return;

    let isMounted = true;
    const fetchFullMeeting = async () => {
      setIsLoadingDetail(true);
      try {
        const full = await api.getMeeting(activeMeetingId);
        if (isMounted) {
          setMeetings((prev) => {
            const exists = prev.some((m) => m.id === full.id);
            if (exists) {
              return prev.map((m) => (m.id === full.id ? full : m));
            }
            return [full, ...prev];
          });
        }
      } catch (err: any) {
        console.error(`Failed to fetch full meeting ${activeMeetingId}:`, err);
        showToast(`Could not load details: ${err.message}`);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    fetchFullMeeting();

    return () => {
      isMounted = false;
    };
  }, [activeMeetingId]);

  // Current active meeting from in-memory cache
  const activeMeeting = useMemo(() => {
    if (!activeMeetingId) return null;
    return meetings.find((m) => m.id === activeMeetingId) || null;
  }, [meetings, activeMeetingId]);

  // Determine active utterance based on current time
  const activeUtteranceId = useMemo(() => {
    if (!activeMeeting || !activeMeeting.transcript || activeMeeting.transcript.length === 0) return null;
    const match = activeMeeting.transcript.find(
      (u) => currentTime >= u.startTime && currentTime <= u.endTime
    );
    if (match) return match.id;

    // Fallback: match closest utterance within 5 seconds if currentTime lands in an inter-utterance gap
    let closest = activeMeeting.transcript[0];
    let minDiff = Math.abs(currentTime - closest.startTime);
    for (const u of activeMeeting.transcript) {
      const diff = Math.min(Math.abs(currentTime - u.startTime), Math.abs(currentTime - u.endTime));
      if (diff < minDiff) {
        minDiff = diff;
        closest = u;
      }
    }
    return minDiff <= 5 ? closest.id : null;
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

  // Update meeting title with SQLite API persistence
  const updateMeetingTitle = async (meetingId: string, newTitle: string) => {
    const previous = meetings.find((m) => m.id === meetingId)?.title || '';
    // Optimistic update
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, title: newTitle } : m))
    );

    try {
      const res = await api.updateMeeting(meetingId, { title: newTitle });
      if (res.meeting) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingId ? { ...m, title: res.meeting.title } : m))
        );
      }
    } catch (err: any) {
      console.error('Failed to update title in backend:', err);
      // Revert optimistic update
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, title: previous } : m))
      );
      showToast(`Failed to save title: ${err.message}`);
    }
  };

  // Toggle action item with SQLite API persistence
  const toggleActionItem = async (meetingId: string, actionId: string) => {
    // Check both meetings.actionItems and userActions
    const targetAction =
      meetings.find((m) => m.id === meetingId)?.actionItems?.find((a) => a.id === actionId) ||
      userActions.find((a) => a.id === actionId);

    const previousStatus = targetAction ? targetAction.completed : false;
    const newStatus = !previousStatus;

    // 1. Optimistic UI update for meetings
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: (m.actionItems || []).map((act) =>
            act.id === actionId ? { ...act, completed: newStatus } : act
          )
        };
      })
    );

    // 1b. Optimistic UI update for userActions
    setUserActions((prev) => {
      const updated = prev.map((act) =>
        act.id === actionId ? { ...act, completed: newStatus } : act
      );
      const pending = updated.filter((a) => !a.completed).length;
      const completed = updated.filter((a) => a.completed).length;
      const dueSoon = updated.filter((a) => !a.completed && a.isDueSoon).length;
      setUserActionStats((s) => ({ ...s, pending, completed, dueSoon }));
      return updated;
    });

    // 1c. Optimistic UI update for userMeetings
    setUserMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: (m.actionItems || []).map((act) =>
            act.id === actionId ? { ...act, completed: newStatus } : act
          ),
          stats: m.stats
            ? {
                ...m.stats,
                myPendingActionsCount: Math.max(0, (m.stats.myPendingActionsCount || 0) + (newStatus ? -1 : 1))
              }
            : undefined
        };
      })
    );

    // 2. Persist to real backend API
    try {
      const res = await api.updateAction(meetingId, actionId, { completed: newStatus });
      if (res.actionItem) {
        setMeetings((prev) =>
          prev.map((m) => {
            if (m.id !== meetingId) return m;
            return {
              ...m,
              actionItems: (m.actionItems || []).map((act) =>
                act.id === actionId ? res.actionItem : act
              )
            };
          })
        );
      }
    } catch (err: any) {
      console.error('Failed to update action item in backend:', err);
      // Revert optimistic update on failure
      setMeetings((prev) =>
        prev.map((m) => {
          if (m.id !== meetingId) return m;
          return {
            ...m,
            actionItems: (m.actionItems || []).map((act) =>
              act.id === actionId ? { ...act, completed: previousStatus } : act
            )
          };
        })
      );
      setUserActions((prev) => {
        const reverted = prev.map((act) =>
          act.id === actionId ? { ...act, completed: previousStatus } : act
        );
        const pending = reverted.filter((a) => !a.completed).length;
        const completed = reverted.filter((a) => a.completed).length;
        const dueSoon = reverted.filter((a) => !a.completed && a.isDueSoon).length;
        setUserActionStats((s) => ({ ...s, pending, completed, dueSoon }));
        return reverted;
      });
      setUserMeetings((prev) =>
        prev.map((m) => {
          if (m.id !== meetingId) return m;
          return {
            ...m,
            actionItems: (m.actionItems || []).map((act) =>
              act.id === actionId ? { ...act, completed: previousStatus } : act
            ),
            stats: m.stats
              ? {
                  ...m.stats,
                  myPendingActionsCount: Math.max(0, (m.stats.myPendingActionsCount || 0) + (previousStatus ? -1 : 1))
                }
              : undefined
          };
        })
      );
      showToast(`Action update failed: ${err.message}`);
    }
  };

  // Set active template with SQLite API persistence
  const setMeetingTemplate = async (meetingId: string, templateKey: string) => {
    const previous = meetings.find((m) => m.id === meetingId)?.activeTemplate || 'executive';

    // Optimistic update
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, activeTemplate: templateKey } : m))
    );

    try {
      await api.updateMeeting(meetingId, { activeTemplate: templateKey });
    } catch (err: any) {
      console.error('Failed to save template selection:', err);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, activeTemplate: previous } : m))
      );
      showToast(`Failed to update template: ${err.message}`);
    }
  };

  const toggleAttendeeShare = (meetingId: string, email: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const shares = m.shares || [];
        const existing = shares.find((s) => s.email.toLowerCase() === email.toLowerCase());
        let updatedShares: ShareRecipient[];
        if (existing) {
          updatedShares = shares.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
        } else {
          const participant = (m.participants || []).find((p) => p.email.toLowerCase() === email.toLowerCase());
          updatedShares = [
            ...shares,
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
        const shares = m.shares || [];
        previousShares = [...shares];
        const participant = (m.participants || []).find((p) => p.email.toLowerCase() === cleanEmail);
        const alreadyShared = shares.some((s) => s.email.toLowerCase() === cleanEmail);
        if (alreadyShared) return m;

        return {
          ...m,
          shares: [
            ...shares,
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
          shares: (m.shares || []).filter((s) => s.email.toLowerCase() !== email.toLowerCase())
        };
      })
    );
    showToast(`Access revoked for ${email}`);
  };

  // Import meeting via intake pipeline and sync workspace state
  const importMeeting = async (payload: {
    source: 'template' | 'file';
    templateId?: string;
    fileMeta?: any;
    title?: string;
    participantIds?: string[];
  }): Promise<Meeting> => {
    const res = await api.importMeeting(payload);
    const imported = res.meeting;
    await Promise.all([
      loadMeetings(),
      loadUserActions(),
      loadUserMeetings()
    ]);
    setActiveMeetingId(imported.id);
    showToast(`Imported "${imported.title}" into workspace!`);
    return imported;
  };

  // Add simulated meeting and persist to SQLite
  const addSimulatedMeeting = async (newMeeting: Meeting) => {
    try {
      const res = await api.createMeeting(newMeeting);
      const persisted = res.meeting || newMeeting;
      await Promise.all([
        loadMeetings(),
        loadUserActions(),
        loadUserMeetings()
      ]);
      setActiveMeetingId(persisted.id);
      showToast(`Captured "${persisted.title}" with AI summary & action items!`);
    } catch (err: any) {
      console.error('Failed to persist simulated meeting to backend:', err);
      // Fallback in memory if backend error
      setMeetings((prev) => [newMeeting, ...prev]);
      setActiveMeetingId(newMeeting.id);
      showToast(`Meeting added locally (backend error: ${err.message})`);
    }
  };

  // Dedicated navigation helper for search results & citations
  const navigateToMeeting = (
    meetingId: string,
    tab: 'summary' | 'actions' | 'transcript' | 'ask' | 'highlights' = 'summary',
    timestamp?: number
  ) => {
    setActiveMeetingId(meetingId);
    setActiveDetailTab(tab);
    if (timestamp !== undefined && timestamp !== null) {
      seekTo(timestamp, true);
    }
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
        isAccountModalOpen,
        setIsAccountModalOpen,
        isAuthenticated,
        setIsAuthenticated,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        loginWithEmail,
        logout,
        toast,
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        userActions,
        userActionStats,
        isLoadingActions,
        reloadUserActions: loadUserActions,
        userMeetings,
        isLoadingUserMeetings,
        reloadUserMeetings: loadUserMeetings,
        activeDetailTab,
        setActiveDetailTab,
        navigateToMeeting,
        isLoading,
        isLoadingDetail,
        error,
        reloadMeetings: loadMeetings,
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
        isSimulateModalOpen,
        setIsSimulateModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        showToast,
        clearToast,
        addSimulatedMeeting,
        importMeeting,
        evidenceExplorerItem,
        openEvidenceExplorer,
        closeEvidenceExplorer
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
