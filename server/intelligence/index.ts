import { MeetingIntelligenceProvider } from './types.ts';
import { LocalIntelligenceProvider } from './localProvider.ts';
import { LlmIntelligenceProvider } from './llmProvider.ts';

export * from './types.ts';
export * from './grounding.ts';
export * from './localProvider.ts';
export * from './llmProvider.ts';

/**
 * Returns the active meeting intelligence provider.
 * Defaults to LocalIntelligenceProvider unless an external LLM API key is present in environment.
 */
export function getIntelligenceProvider(): MeetingIntelligenceProvider {
  const llm = new LlmIntelligenceProvider();
  if (llm.isConfigured()) {
    return llm;
  }
  return new LocalIntelligenceProvider();
}

/**
 * Returns diagnostic metadata about which intelligence provider is currently loaded.
 */
export function getIntelligenceStatus() {
  const llm = new LlmIntelligenceProvider();
  const isConfigured = llm.isConfigured();

  return {
    providerId: isConfigured ? llm.id : 'local-deterministic',
    providerName: isConfigured ? llm.name : 'Meetwise Grounded Extraction Engine',
    model: isConfigured ? llm.model : 'deterministic-grounding-v2',
    isLlmConfigured: isConfigured,
    mode: isConfigured ? 'cloud' : 'local'
  };
}
