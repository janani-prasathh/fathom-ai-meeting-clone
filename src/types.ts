export interface Participant {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  role: string;
  color: string;
}

export type WorkspaceView = 'overview' | 'actions' | 'decisions' | 'questions' | 'my-meetings' | 'meetings';

export interface UserInvolvement {
  attended: boolean;
  myActionsCount: number;
  decisionsCount: number;
  spokeCount: number;
}

export interface MeetingStats {
  totalActions: number;
  completedActions: number;
  decisionsCount: number;
  questionsCount: number;
  utterancesCount?: number;
  myActionsCount?: number;
  myPendingActionsCount?: number;
}

export interface UserActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  title: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string;
  completed: boolean;
  dueDate: string;
  dueDateLabel: string;
  isDueSoon: boolean;
  timestamp?: number;
  sourceQuote?: string;
  confidence?: number;
  sourceUtteranceId?: string;
}

export interface TranscriptUtterance {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerAvatar: string;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: Participant;
  completed: boolean;
  timestamp: number; // seconds
  sourceQuote: string;
  confidence?: number;
  evidenceStart?: number;
  evidenceEnd?: number;
  sourceUtteranceId?: string;
}

export interface Highlight {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  speakerName: string;
  summary: string;
  tag: 'Key Decision' | 'Product Feedback' | 'Technical Architecture' | 'Action Item';
}

export interface TopicDiscussion {
  title: string;
  timestamp: number;
  bullets: string[];
}

export interface SummaryTemplate {
  key: string;
  name: string;
  description: string;
  overview: string;
  sections: {
    heading: string;
    bullets: string[];
  }[];
}

export interface ShareRecipient {
  email: string;
  name?: string;
  avatar?: string;
  isAttendee: boolean;
  sharedAt: string;
  revoked: boolean;
}

export interface DecisionInsight {
  id?: string;
  text: string;
  timestamp?: number;
  confidence?: number;
  sourceUtteranceId?: string;
}

export interface OpenQuestion {
  id: string;
  question: string;
  timestamp?: number;
  speakerName?: string;
  context?: string;
  confidence?: number;
  sourceUtteranceId?: string;
}

export interface EvidenceItem {
  id?: string;
  type: 'action' | 'decision' | 'question' | 'topic';
  title: string;
  meetingId: string;
  meetingTitle: string;
  speakerName?: string;
  speakerAvatar?: string;
  timestamp?: number;
  sourceQuote?: string;
  confidence?: number;
  sourceUtteranceId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  whyAppears?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  originalCalendarTitle?: string;
  date: string; // ISO date string
  durationSeconds: number;
  participants: Participant[];
  overview: string;
  keyDecisions: string[];
  keyDecisionDetails?: DecisionInsight[];
  topics: TopicDiscussion[];
  actionItems: ActionItem[];
  highlights: Highlight[];
  openQuestions?: OpenQuestion[];
  transcript: TranscriptUtterance[];
  shares: ShareRecipient[];
  activeTemplate: string;
  templates: Record<string, SummaryTemplate>;
  suggestedQuestions: string[];
  tags: string[];
  stats?: MeetingStats;
  involvement?: UserInvolvement;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  citations?: {
    meetingId: string;
    meetingTitle: string;
    timestamp: number;
    speakerName?: string;
    quote: string;
  }[];
}

export interface IntakeTemplate {
  id: string;
  title: string;
  sourceType: 'audio' | 'video' | 'transcript';
  fileName: string;
  fileSize: string;
  durationSeconds: number;
  durationFormatted: string;
  description: string;
  participants: Participant[];
  previewOutcomes: {
    actionsCount: number;
    decisionsCount: number;
    questionsCount: number;
  };
  sampleAction: string;
  sampleDecision: string;
}

