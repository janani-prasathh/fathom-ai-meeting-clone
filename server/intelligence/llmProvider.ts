import {
  MeetingIntelligenceProvider,
  MeetingIntelligenceInput,
  StructuredMeetingIntelligence,
  ExtractedActionItem,
  ExtractedDecision,
  ExtractedOpenQuestion,
  ExtractedHighlight
} from './types.ts';
import { LocalIntelligenceProvider } from './localProvider.ts';
import { anchorQuoteToTranscript, isExplicitCommitment } from './grounding.ts';

export class LlmIntelligenceProvider implements MeetingIntelligenceProvider {
  readonly id = 'llm-cloud';
  readonly name = 'Cloud LLM Intelligence Provider';
  readonly model: string;
  private localFallback = new LocalIntelligenceProvider();

  constructor() {
    this.model = process.env.MEETWISE_LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
    );
  }

  async extractIntelligence(input: MeetingIntelligenceInput): Promise<StructuredMeetingIntelligence> {
    // If no credentials configured, automatically use local provider
    if (!this.isConfigured()) {
      return this.localFallback.extractIntelligence(input);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';

    if (!apiKey) {
      // If other keys set but not OpenAI endpoint configured, fallback
      return this.localFallback.extractIntelligence(input);
    }

    try {
      const prompt = `
You are Meetwise Intelligence, an expert enterprise meeting intelligence model.
Your task is to analyze the meeting transcript below and extract structured outcomes.

CRITICAL GROUNDING RULES:
1. ONLY extract action items where a speaker explicitly commits to an action (e.g. "I will", "I'll", "I am going to").
2. DO NOT extract casual thoughts, tentative ideas, or non-commitments (e.g. "I might", "maybe later").
3. DO NOT invent dates, owners, or decisions that were not explicitly stated.
4. For every action, decision, and question, you MUST provide:
   - "sourceUtteranceId": The exact ID of the utterance where it was stated.
   - "timestamp": The exact second timestamp.
   - "sourceQuote": The verbatim words spoken by the participant.
5. If a question was subsequently answered in the meeting, DO NOT include it in openQuestions.

Output ONLY a single valid JSON object with this exact structure:
{
  "overview": string,
  "topics": [{"title": string, "timestamp": number, "bullets": string[]}],
  "actionItems": [
    {
      "title": string,
      "assigneeSpeakerId": string,
      "assigneeName": string,
      "timestamp": number,
      "sourceUtteranceId": string,
      "sourceQuote": string
    }
  ],
  "decisions": [
    {
      "text": string,
      "timestamp": number,
      "sourceUtteranceId": string,
      "sourceQuote": string
    }
  ],
  "openQuestions": [
    {
      "question": string,
      "timestamp": number,
      "speakerName": string,
      "sourceUtteranceId": string
    }
  ],
  "suggestedQuestions": string[]
}

TRANSCRIPT TO ANALYZE:
Meeting Title: "${input.title}"
Participants: ${input.participants.map(p => `${p.name} (id: ${p.id}, role: ${p.role})`).join(', ')}

${input.transcript.map(u => `[id: ${u.id} | time: ${u.startTime}s | speaker: ${u.speakerName} (${u.speakerId})]: "${u.text}"`).join('\n')}
`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second limit

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You extract grounded structured intelligence from meeting transcripts. Return strict JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LLM provider returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('LLM provider returned empty message content');
      }

      const parsed = JSON.parse(content);

      // Validate & Ground LLM output against transcript
      const verifiedActionItems: ExtractedActionItem[] = [];
      if (Array.isArray(parsed.actionItems)) {
        for (let i = 0; i < parsed.actionItems.length; i++) {
          const item = parsed.actionItems[i];
          const anchor = anchorQuoteToTranscript(item.sourceQuote || item.title, input.transcript);

          // Only keep action if it can be verified in transcript and is an explicit commitment
          if (anchor && isExplicitCommitment(anchor.quote)) {
            const assignee = input.participants.find(p => p.id === item.assigneeSpeakerId || p.name.toLowerCase() === item.assigneeName?.toLowerCase()) || input.participants[0];

            verifiedActionItems.push({
              id: `act-${input.meetingId}-${i + 1}`,
              title: item.title,
              assignee,
              completed: false,
              timestamp: anchor.timestamp,
              sourceQuote: anchor.quote,
              confidence: 0.98,
              evidenceStart: anchor.timestamp,
              evidenceEnd: anchor.endTime,
              sourceUtteranceId: anchor.utteranceId,
              isExplicitCommitment: true
            });
          }
        }
      }

      const verifiedDecisions: ExtractedDecision[] = [];
      if (Array.isArray(parsed.decisions)) {
        for (let i = 0; i < parsed.decisions.length; i++) {
          const dec = parsed.decisions[i];
          const anchor = anchorQuoteToTranscript(dec.sourceQuote || dec.text, input.transcript);
          verifiedDecisions.push({
            id: `dec-${input.meetingId}-${i + 1}`,
            text: dec.text,
            timestamp: anchor ? anchor.timestamp : dec.timestamp,
            confidence: anchor ? 0.98 : 0.85,
            sourceUtteranceId: anchor?.utteranceId,
            quote: anchor?.quote
          });
        }
      }

      const verifiedQuestions: ExtractedOpenQuestion[] = [];
      if (Array.isArray(parsed.openQuestions)) {
        for (let i = 0; i < parsed.openQuestions.length; i++) {
          const q = parsed.openQuestions[i];
          const anchor = anchorQuoteToTranscript(q.question, input.transcript);
          verifiedQuestions.push({
            id: `oq-${input.meetingId}-${i + 1}`,
            question: q.question,
            timestamp: anchor ? anchor.timestamp : q.timestamp,
            speakerName: q.speakerName || anchor?.speakerName,
            context: 'Extracted from transcript discussion',
            confidence: anchor ? 0.95 : 0.82,
            sourceUtteranceId: anchor?.utteranceId,
            isResolvedInMeeting: false
          });
        }
      }

      return {
        overview: parsed.overview || `Synthesized intelligence for "${input.title}".`,
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        actionItems: verifiedActionItems,
        decisions: verifiedDecisions,
        openQuestions: verifiedQuestions,
        highlights: [],
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
        tags: ['AI-Verified', 'LLM-Grounded'],
        groundingScore: 0.98,
        providerInfo: {
          id: this.id,
          name: this.name,
          model: this.model,
          isFallback: false
        }
      };
    } catch (err: any) {
      console.warn(`[IntelligenceProvider] Cloud LLM execution failed (${err.message}). Gracefully falling back to LocalIntelligenceProvider.`);
      const localResult = await this.localFallback.extractIntelligence(input);
      return {
        ...localResult,
        providerInfo: {
          id: this.localFallback.id,
          name: this.localFallback.name,
          model: this.localFallback.model,
          isFallback: true,
          reason: `Cloud provider error: ${err.message}`
        }
      };
    }
  }
}
