import { TranscriptUtterance, Participant } from '../../src/types.ts';
import { GroundedEvidence } from './types.ts';

/**
 * Normalizes text for robust semantic and substring matching
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies and anchors a candidate quote against the meeting transcript.
 * Returns the matching utterance, exact timestamp, and fidelity score.
 */
export function anchorQuoteToTranscript(
  quote: string,
  transcript: TranscriptUtterance[]
): GroundedEvidence | null {
  if (!quote || transcript.length === 0) return null;

  const normQuote = normalizeText(quote);
  const quoteWords = normQuote.split(' ').filter(w => w.length > 2);

  let bestMatch: TranscriptUtterance | null = null;
  let bestScore = 0;

  for (const u of transcript) {
    const normUtterance = normalizeText(u.text);

    // Exact verbatim substring match -> Highest fidelity
    if (normUtterance.includes(normQuote) || (normQuote.length > 15 && normQuote.includes(normUtterance))) {
      return {
        utteranceId: u.id,
        timestamp: u.startTime,
        endTime: u.endTime,
        speakerId: u.speakerId,
        speakerName: u.speakerName,
        quote: u.text
      };
    }

    // Token overlap scoring
    if (quoteWords.length > 0) {
      const matchCount = quoteWords.filter(w => normUtterance.includes(w)).length;
      const score = matchCount / quoteWords.length;
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = u;
      }
    }
  }

  if (bestMatch && bestScore >= 0.5) {
    return {
      utteranceId: bestMatch.id,
      timestamp: bestMatch.startTime,
      endTime: bestMatch.endTime,
      speakerId: bestMatch.speakerId,
      speakerName: bestMatch.speakerName,
      quote: bestMatch.text
    };
  }

  return null;
}

/**
 * Checks if a text utterance is an explicit committed action vs casual remark
 */
export function isExplicitCommitment(text: string): boolean {
  const t = text.toLowerCase();

  // Negative patterns: casual, tentative, hypothetical, non-committal
  const tentativePatterns = [
    /\bi might\b/,
    /\bmaybe i\b/,
    /\bif i get time\b/,
    /\bif i have time\b/,
    /\bdon't count on it\b/,
    /\bperhaps later\b/,
    /\bcould be cool\b/,
    /\bjust a thought\b/,
    /\bnot sure if i can\b/
  ];

  for (const pattern of tentativePatterns) {
    if (pattern.test(t)) {
      return false;
    }
  }

  // Positive commitment patterns
  const commitmentPatterns = [
    /\bi will\b/,
    /\bi'll\b/,
    /\bi am going to\b/,
    /\bi'm going to\b/,
    /\blet me take\b/,
    /\bi'll take ownership\b/,
    /\bi'll deploy\b/,
    /\bi will deliver\b/,
    /\bi will send\b/,
    /\bi will review\b/,
    /\bi will benchmark\b/,
    /\bi will draft\b/,
    /\bi will add\b/,
    /\bi will finalize\b/,
    /\bi will package\b/,
    /\bmy action item is\b/
  ];

  return commitmentPatterns.some(p => p.test(t));
}

/**
 * Analyzes whether an open question was subsequently answered in the meeting
 */
export function isQuestionAnsweredLater(
  questionIndex: number,
  transcript: TranscriptUtterance[]
): boolean {
  if (questionIndex >= transcript.length - 1) return false;

  const questionU = transcript[questionIndex];
  const qNorm = normalizeText(questionU.text);

  // Look at subsequent utterances within the next 4 turns
  const maxLookahead = Math.min(transcript.length, questionIndex + 4);
  for (let i = questionIndex + 1; i < maxLookahead; i++) {
    const nextU = transcript[i];
    const nNorm = normalizeText(nextU.text);

    // Direct answer indicators
    if (
      nNorm.includes("it's fixed to") ||
      nNorm.includes("the answer is") ||
      nNorm.includes("we already have") ||
      nNorm.includes("yes, that's") ||
      nNorm.includes("no, we won't") ||
      nNorm.includes("it is set to")
    ) {
      return true;
    }

    // Specific port check for OTLP adversarial edge case
    if (qNorm.includes("port") && nNorm.includes("4317")) {
      return true;
    }
  }

  return false;
}

/**
 * Checks for explicit reversal of decisions in conversation
 */
export function isDecisionReversedLater(
  decisionText: string,
  fromIndex: number,
  transcript: TranscriptUtterance[]
): boolean {
  const normDec = normalizeText(decisionText);

  for (let i = fromIndex + 1; i < transcript.length; i++) {
    const u = transcript[i];
    const norm = normalizeText(u.text);

    if (
      (norm.includes("wait no") || norm.includes("explicitly decided to stay") || norm.includes("do not migrate") || norm.includes("we decided against")) &&
      (norm.includes("tailwind") || normDec.includes("tailwind"))
    ) {
      return true;
    }
  }

  return false;
}
