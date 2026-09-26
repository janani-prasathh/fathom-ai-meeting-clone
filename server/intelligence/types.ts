import { Participant, TranscriptUtterance } from '../../src/types.ts';

export interface GroundedEvidence {
  utteranceId: string;
  timestamp: number; // seconds
  endTime?: number;
  speakerId?: string;
  speakerName?: string;
  quote: string;
}

export interface ExtractedActionItem {
  id: string;
  title: string;
  assignee: Participant;
  completed: boolean;
  timestamp: number;
  sourceQuote: string;
  confidence: number; // 0.0 - 1.0
  evidenceStart?: number;
  evidenceEnd?: number;
  sourceUtteranceId?: string;
  isExplicitCommitment: boolean;
}

export interface ExtractedDecision {
  id: string;
  text: string;
  timestamp?: number;
  confidence: number; // 0.0 - 1.0
  sourceUtteranceId?: string;
  quote?: string;
}

export interface ExtractedOpenQuestion {
  id: string;
  question: string;
  timestamp?: number;
  speakerName?: string;
  context?: string;
  confidence: number; // 0.0 - 1.0
  sourceUtteranceId?: string;
  isResolvedInMeeting: boolean;
}

export interface ExtractedHighlight {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  speakerName: string;
  summary: string;
  tag: 'Key Decision' | 'Product Feedback' | 'Technical Architecture' | 'Action Item';
}

export interface StructuredMeetingIntelligence {
  overview: string;
  topics: Array<{
    title: string;
    timestamp: number;
    bullets: string[];
  }>;
  actionItems: ExtractedActionItem[];
  decisions: ExtractedDecision[];
  openQuestions: ExtractedOpenQuestion[];
  highlights: ExtractedHighlight[];
  suggestedQuestions: string[];
  tags: string[];
  groundingScore: number; // 0.0 to 1.0
  providerInfo: {
    id: string;
    name: string;
    model?: string;
    isFallback?: boolean;
    reason?: string;
  };
}

export interface MeetingIntelligenceInput {
  meetingId: string;
  title: string;
  date: string;
  participants: Participant[];
  transcript: TranscriptUtterance[];
  durationSeconds?: number;
}

export interface MeetingIntelligenceProvider {
  readonly id: string;
  readonly name: string;
  readonly model?: string;
  isConfigured(): boolean;
  extractIntelligence(input: MeetingIntelligenceInput): Promise<StructuredMeetingIntelligence>;
}
