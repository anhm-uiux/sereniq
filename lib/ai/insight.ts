import { callWithFallback } from './provider';
import { INSIGHT_SYSTEM_PROMPT, buildInsightUserPrompt } from './prompts';
import { checkSafety } from './safety';

export interface JournalInsight {
  summary: string;
  triggers: string[];
  emotionTags: string[];
  riskLevel: 'none' | 'mild' | 'elevated';
  flaggedForSafety: boolean;
}

/**
 * Strips markdown code fences if the model wraps JSON in them despite instructions.
 * Models occasionally do this even when told not to — cheap defensive parsing.
 */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenced ? fenced[1] : raw;
}

export async function generateInsight(journalText: string, moodScore: number): Promise<JournalInsight> {
  // Checkpoint 1: check the raw input before it ever reaches an LLM.
  const inputSafety = checkSafety(journalText);

  const userPrompt = buildInsightUserPrompt(journalText, moodScore);
  const raw = await callWithFallback(INSIGHT_SYSTEM_PROMPT, userPrompt);

  let parsed: Partial<JournalInsight>;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    // If the model didn't return valid JSON, fail soft rather than crashing the request.
    parsed = {
      summary: 'We had trouble analyzing this entry in detail, but it has been saved.',
      triggers: [],
      emotionTags: [],
      riskLevel: 'none',
    };
  }

  const modelFlaggedElevated = parsed.riskLevel === 'elevated';

  return {
    summary: parsed.summary ?? '',
    triggers: parsed.triggers ?? [],
    emotionTags: parsed.emotionTags ?? [],
    riskLevel: parsed.riskLevel ?? 'none',
    // Flag if EITHER the keyword check or the model itself thinks this is elevated risk.
    flaggedForSafety: inputSafety.flagged || modelFlaggedElevated,
  };
}
