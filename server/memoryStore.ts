import { seedMeetings, participants as seedParticipants } from '../src/data/seedMeetings.ts';
import { Meeting, Participant, UserActionItem } from '../src/types.ts';

// Clone initial state deeply so runtime mutations remain isolated
let meetingsStore: Meeting[] = JSON.parse(JSON.stringify(seedMeetings));
let participantsStore: Record<string, Participant> = JSON.parse(JSON.stringify(seedParticipants));

export function getInMemoryMeetings() {
  return meetingsStore.map(m => {
    const totalActions = m.actionItems?.length || 0;
    const completedActions = m.actionItems?.filter(a => a.completed)?.length || 0;
    const decisionsCount = (m.keyDecisionDetails?.length || m.keyDecisions?.length || 0);
    const questionsCount = m.openQuestions?.length || 0;
    const utterancesCount = m.transcript?.length || 0;

    return {
      id: m.id,
      title: m.title,
      originalCalendarTitle: m.originalCalendarTitle,
      date: m.date,
      durationSeconds: m.durationSeconds,
      overview: m.overview,
      activeTemplate: m.activeTemplate || 'executive',
      tags: m.tags || [],
      participants: m.participants || [],
      stats: {
        totalActions,
        completedActions,
        decisionsCount,
        questionsCount,
        utterancesCount
      }
    };
  });
}

export function getInMemoryMeetingById(id: string): Meeting | null {
  const meeting = meetingsStore.find(m => m.id === id);
  if (!meeting) return null;
  return JSON.parse(JSON.stringify(meeting));
}

export function getInMemoryParticipants(): Participant[] {
  return Object.values(participantsStore);
}

export function saveInMemoryMeeting(m: any): Meeting {
  const meetingId = m.id || `meeting-${Date.now()}`;
  const existingIdx = meetingsStore.findIndex(x => x.id === meetingId);
  const fullMeeting: Meeting = {
    ...m,
    id: meetingId,
    date: m.date || new Date().toISOString(),
    durationSeconds: m.durationSeconds || 0,
    overview: m.overview || '',
    activeTemplate: m.activeTemplate || 'executive',
    participants: m.participants || [],
    transcript: m.transcript || [],
    actionItems: m.actionItems || [],
    keyDecisions: m.keyDecisions || [],
    keyDecisionDetails: m.keyDecisionDetails || [],
    openQuestions: m.openQuestions || [],
    highlights: m.highlights || [],
    topics: m.topics || [],
    shares: m.shares || [],
    templates: m.templates || {},
    suggestedQuestions: m.suggestedQuestions || [],
    tags: m.tags || []
  };

  if (existingIdx >= 0) {
    meetingsStore[existingIdx] = fullMeeting;
  } else {
    meetingsStore.unshift(fullMeeting);
  }

  return fullMeeting;
}

export function getInMemoryUserMeetings(userId: string) {
  const matchingMeetings = meetingsStore.filter(m => {
    const isParticipant = m.participants?.some(p => p.id === userId);
    const hasAction = m.actionItems?.some(a => a.assignee?.id === userId);
    const hasSpoken = m.transcript?.some(u => u.speakerId === userId);
    return isParticipant || hasAction || hasSpoken;
  });

  return matchingMeetings.map(m => {
    const isAttendee = m.participants?.some(p => p.id === userId);
    const myActions = m.actionItems?.filter(a => a.assignee?.id === userId) || [];
    const myActionsCount = myActions.length;
    const myCompletedActionsCount = myActions.filter(a => a.completed).length;
    const myPendingActionsCount = myActionsCount - myCompletedActionsCount;
    const decisionsCount = (m.keyDecisionDetails?.length || m.keyDecisions?.length || 0);
    const questionsCount = m.openQuestions?.length || 0;
    const spokeCount = m.transcript?.filter(u => u.speakerId === userId).length || 0;

    return {
      id: m.id,
      title: m.title,
      originalCalendarTitle: m.originalCalendarTitle,
      date: m.date,
      durationSeconds: m.durationSeconds,
      overview: m.overview,
      activeTemplate: m.activeTemplate || 'executive',
      tags: m.tags || [],
      participants: m.participants || [],
      stats: {
        totalActions: m.actionItems?.length || 0,
        completedActions: m.actionItems?.filter(a => a.completed).length || 0,
        decisionsCount,
        questionsCount,
        myActionsCount,
        myPendingActionsCount
      },
      involvement: {
        attended: Boolean(isAttendee),
        myActionsCount,
        decisionsCount,
        spokeCount
      }
    };
  });
}

export function getInMemoryUserActions(userId: string, completed?: string | boolean): UserActionItem[] {
  const userActions: UserActionItem[] = [];

  meetingsStore.forEach(m => {
    (m.actionItems || []).forEach(a => {
      if (a.assignee?.id === userId) {
        const isCompleted = Boolean(a.completed);
        if (completed !== undefined) {
          const matchComp = completed === 'true' || completed === '1' || completed === true;
          if (isCompleted !== matchComp) return;
        }

        const mDate = new Date(m.date);
        const idx = userActions.length;
        const dueObj = new Date(mDate.getTime() + (idx % 2 === 0 ? 1 : 3) * 24 * 60 * 60 * 1000);
        const dueDateLabel = isCompleted
          ? `Completed ${mDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : idx === 0 ? 'Due tomorrow' : `Due ${dueObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        userActions.push({
          id: a.id,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          title: a.title,
          ownerId: a.assignee.id,
          ownerName: a.assignee.name,
          ownerEmail: a.assignee.email,
          ownerAvatar: a.assignee.avatar,
          completed: isCompleted,
          dueDate: dueObj.toISOString().split('T')[0],
          dueDateLabel,
          isDueSoon: !isCompleted && idx < 2,
          timestamp: a.timestamp,
          sourceQuote: a.sourceQuote,
          confidence: a.confidence,
          sourceUtteranceId: a.sourceUtteranceId
        });
      }
    });
  });

  return userActions.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime();
  });
}

export function getInMemoryUserDecisions(userId: string) {
  const decisions: any[] = [];
  const relevantMeetings = meetingsStore.filter(m => {
    return m.participants?.some(p => p.id === userId) ||
           m.actionItems?.some(a => a.assignee?.id === userId) ||
           m.transcript?.some(u => u.speakerId === userId);
  });

  relevantMeetings.forEach(m => {
    if (m.keyDecisionDetails && m.keyDecisionDetails.length > 0) {
      m.keyDecisionDetails.forEach(d => {
        decisions.push({
          id: d.id,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          text: d.text,
          timestamp: d.timestamp
        });
      });
    } else if (m.keyDecisions && m.keyDecisions.length > 0) {
      m.keyDecisions.forEach((text, idx) => {
        decisions.push({
          id: `dec-${m.id}-${idx}`,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          text,
          timestamp: undefined
        });
      });
    }
  });

  return decisions.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
}

export function getInMemoryUserQuestions(userId: string) {
  const questions: any[] = [];
  const relevantMeetings = meetingsStore.filter(m => {
    return m.participants?.some(p => p.id === userId) ||
           m.actionItems?.some(a => a.assignee?.id === userId) ||
           m.transcript?.some(u => u.speakerId === userId);
  });

  relevantMeetings.forEach(m => {
    (m.openQuestions || []).forEach(q => {
      questions.push({
        id: q.id,
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.date,
        question: q.question,
        speakerName: q.speakerName,
        timestamp: q.timestamp,
        context: q.context
      });
    });
  });

  return questions.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
}

export function updateInMemoryAction(meetingId: string, actionId: string, updates: { completed?: boolean; title?: string; assigneeId?: string }) {
  const meeting = meetingsStore.find(m => m.id === meetingId);
  if (!meeting) return null;
  const action = meeting.actionItems?.find(a => a.id === actionId);
  if (!action) return null;

  if (updates.completed !== undefined) {
    action.completed = updates.completed;
  }
  if (updates.title !== undefined) {
    action.title = updates.title;
  }
  if (updates.assigneeId !== undefined) {
    const participant = Object.values(participantsStore).find(p => p.id === updates.assigneeId);
    if (participant) {
      action.assignee = participant;
    }
  }

  return action;
}
