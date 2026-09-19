export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  color: string;
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

export interface Meeting {
  id: string;
  title: string;
  originalCalendarTitle?: string;
  date: string; // ISO date string
  durationSeconds: number;
  participants: Participant[];
  overview: string;
  keyDecisions: string[];
  topics: TopicDiscussion[];
  actionItems: ActionItem[];
  highlights: Highlight[];
  transcript: TranscriptUtterance[];
  shares: ShareRecipient[];
  activeTemplate: string;
  templates: Record<string, SummaryTemplate>;
  suggestedQuestions: string[];
  tags: string[];
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
    quote: string;
  }[];
}
