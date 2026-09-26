import { Meeting, ActionItem, TranscriptUtterance, DecisionInsight, OpenQuestion, Participant, IntakeTemplate } from '../types.ts';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  if (!response.ok) {
    let errBody: any;
    try {
      errBody = await response.json();
    } catch {
      errBody = { error: response.statusText };
    }
    throw new ApiError(
      errBody.error || errBody.message || `Request failed with status ${response.status}`,
      response.status,
      errBody
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Health check
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return request<{ status: string; timestamp: string }>('/api/health');
  },

  /**
   * Intelligence provider status
   */
  async getIntelligenceStatus(): Promise<{
    success: boolean;
    status: {
      providerId: string;
      providerName: string;
      model?: string;
      isLlmConfigured: boolean;
      mode: string;
    };
  }> {
    return request('/api/intelligence/status');
  },

  /**
   * Get all meetings list with computed summary stats
   */
  async getMeetings(): Promise<{ count: number; meetings: Meeting[] }> {
    return request<{ count: number; meetings: Meeting[] }>('/api/meetings');
  },

  /**
   * Get complete meeting details by ID
   */
  async getMeeting(id: string): Promise<Meeting> {
    return request<Meeting>(`/api/meetings/${encodeURIComponent(id)}`);
  },

  /**
   * Get transcript utterances for a meeting
   */
  async getTranscript(meetingId: string): Promise<{ meetingId: string; count: number; transcript: TranscriptUtterance[] }> {
    return request<{ meetingId: string; count: number; transcript: TranscriptUtterance[] }>(
      `/api/meetings/${encodeURIComponent(meetingId)}/transcript`
    );
  },

  /**
   * Get action items for a meeting
   */
  async getActions(meetingId: string): Promise<{ meetingId: string; count: number; actionItems: ActionItem[] }> {
    return request<{ meetingId: string; count: number; actionItems: ActionItem[] }>(
      `/api/meetings/${encodeURIComponent(meetingId)}/actions`
    );
  },

  /**
   * Update an action item (e.g. toggle completed, change title/assignee)
   */
  async updateAction(
    meetingId: string,
    actionId: string,
    data: { completed?: boolean; title?: string; assigneeId?: string }
  ): Promise<{ success: boolean; actionItem: ActionItem }> {
    return request<{ success: boolean; actionItem: ActionItem }>(
      `/api/meetings/${encodeURIComponent(meetingId)}/actions/${encodeURIComponent(actionId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Get decisions for a meeting
   */
  async getDecisions(meetingId: string): Promise<{ meetingId: string; count: number; decisions: DecisionInsight[] }> {
    return request<{ meetingId: string; count: number; decisions: DecisionInsight[] }>(
      `/api/meetings/${encodeURIComponent(meetingId)}/decisions`
    );
  },

  /**
   * Get open questions for a meeting
   */
  async getQuestions(meetingId: string): Promise<{ meetingId: string; count: number; openQuestions: OpenQuestion[] }> {
    return request<{ meetingId: string; count: number; openQuestions: OpenQuestion[] }>(
      `/api/meetings/${encodeURIComponent(meetingId)}/questions`
    );
  },

  /**
   * Update meeting metadata (title, activeTemplate, overview)
   */
  async updateMeeting(
    meetingId: string,
    data: { title?: string; activeTemplate?: string; overview?: string }
  ): Promise<{ success: boolean; meeting: Meeting }> {
    return request<{ success: boolean; meeting: Meeting }>(
      `/api/meetings/${encodeURIComponent(meetingId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    );
  },

  /**
   * Create or ingest a new meeting into SQLite
   */
  async createMeeting(meeting: Partial<Meeting>): Promise<{ success: boolean; meeting: Meeting }> {
    return request<{ success: boolean; meeting: Meeting }>(
      '/api/meetings',
      {
        method: 'POST',
        body: JSON.stringify(meeting)
      }
    );
  },

  /**
   * Get available intake meeting templates
   */
  async getImportTemplates(): Promise<{ success: boolean; templates: IntakeTemplate[] }> {
    return request<{ success: boolean; templates: IntakeTemplate[] }>('/api/import/templates');
  },

  /**
   * Process and import a meeting via the intake pipeline into SQLite
   */
  async importMeeting(payload: {
    source: 'template' | 'file';
    templateId?: string;
    fileMeta?: { name: string; size: number; type: string };
    title?: string;
    participantIds?: string[];
  }): Promise<{
    success: boolean;
    meeting: Meeting;
    stats: {
      totalActions: number;
      decisionsCount: number;
      questionsCount: number;
      utterancesCount: number;
    };
  }> {
    return request<{
      success: boolean;
      meeting: Meeting;
      stats: {
        totalActions: number;
        decisionsCount: number;
        questionsCount: number;
        utterancesCount: number;
      };
    }>('/api/meetings/import', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Cross-meeting search across titles, transcripts, actions, decisions, questions
   */
  async searchMeetings(
    query: string,
    userId?: string
  ): Promise<{
    query: string;
    totalMatches: number;
    isUserScoped?: boolean;
    people?: any[];
    meetings: any[];
    transcripts: any[];
    actionItems: any[];
    decisions: any[];
    openQuestions: any[];
  }> {
    const params = new URLSearchParams({ q: query });
    if (userId) params.append('userId', userId);
    return request<{
      query: string;
      totalMatches: number;
      isUserScoped?: boolean;
      people?: any[];
      meetings: any[];
      transcripts: any[];
      actionItems: any[];
      decisions: any[];
      openQuestions: any[];
    }>(`/api/search?${params.toString()}`);
  },

  /**
   * Ask Meetwise - Evidence-grounded in-meeting Q&A assistant
   */
  async askMeetingChat(
    meetingId: string,
    question: string,
    userId?: string
  ): Promise<{
    meetingId: string;
    meetingTitle: string;
    question: string;
    answer: string;
    sources: Array<{
      meetingId: string;
      meetingTitle: string;
      timestamp: number;
      speakerName?: string;
      quote: string;
    }>;
    llmProviderConfigured: boolean;
  }> {
    return request<{
      meetingId: string;
      meetingTitle: string;
      question: string;
      answer: string;
      sources: Array<{
        meetingId: string;
        meetingTitle: string;
        timestamp: number;
        speakerName?: string;
        quote: string;
      }>;
      llmProviderConfigured: boolean;
    }>(`/api/meetings/${encodeURIComponent(meetingId)}/chat`, {
      method: 'POST',
      body: JSON.stringify({ question, userId })
    });
  },

  /**
   * Ask Meetwise - Evidence-grounded cross-meeting Q&A assistant
   */
  async askCrossMeetingChat(
    question: string,
    userId?: string
  ): Promise<{
    question: string;
    answer: string;
    sources: Array<{
      meetingId: string;
      meetingTitle: string;
      timestamp: number;
      speakerName?: string;
      quote: string;
    }>;
    llmProviderConfigured: boolean;
  }> {
    return request<{
      question: string;
      answer: string;
      sources: Array<{
        meetingId: string;
        meetingTitle: string;
        timestamp: number;
        speakerName?: string;
        quote: string;
      }>;
      llmProviderConfigured: boolean;
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ question, userId })
    });
  },

  /**
   * Get all registered participants
   */
  async getParticipants(): Promise<Participant[]> {
    const res = await request<{ participants: Participant[] }>('/api/participants');
    return res.participants;
  },

  /**
   * Get action items assigned to a specific user (My Actions)
   */
  async getUserActions(
    userId: string,
    completed?: boolean
  ): Promise<{
    userId: string;
    count: number;
    stats: {
      total: number;
      pending: number;
      completed: number;
      dueSoon: number;
    };
    actionItems: Array<{
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
    }>;
  }> {
    const params = new URLSearchParams();
    if (completed !== undefined) params.append('completed', String(completed));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/users/${encodeURIComponent(userId)}/actions${qs}`);
  },

  /**
   * Get all workspace action items across users
   */
  async getAllActions(
    userId?: string,
    completed?: boolean
  ): Promise<{
    count: number;
    actionItems: Array<{
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
      timestamp?: number;
      sourceQuote?: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (completed !== undefined) params.append('completed', String(completed));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/actions${qs}`);
  },

  /**
   * Get all decisions across meetings
   */
  async getAllDecisions(): Promise<{
    count: number;
    decisions: Array<{
      id: string;
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
      text: string;
      timestamp?: number;
    }>;
  }> {
    return request('/api/decisions');
  },

  /**
   * Get open questions across meetings
   */
  async getAllQuestions(): Promise<{
    count: number;
    openQuestions: Array<{
      id: string;
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
      question: string;
      speakerName?: string;
      timestamp?: number;
      context?: string;
    }>;
  }> {
    return request('/api/questions');
  },

  /**
   * Get user-specific meetings (attended, owns actions, or spoke)
   */
  async getUserMeetings(userId: string): Promise<{
    userId: string;
    count: number;
    meetings: Meeting[];
  }> {
    return request(`/api/users/${encodeURIComponent(userId)}/meetings`);
  },

  /**
   * Get user-specific decisions
   */
  async getUserDecisions(userId: string): Promise<{
    userId: string;
    count: number;
    decisions: Array<{
      id: string;
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
      text: string;
      timestamp?: number;
    }>;
  }> {
    return request(`/api/users/${encodeURIComponent(userId)}/decisions`);
  },

  /**
   * Get user-specific open questions
   */
  async getUserQuestions(userId: string): Promise<{
    userId: string;
    count: number;
    openQuestions: Array<{
      id: string;
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
      question: string;
      speakerName?: string;
      timestamp?: number;
      context?: string;
    }>;
  }> {
    return request(`/api/users/${encodeURIComponent(userId)}/questions`);
  }
};
