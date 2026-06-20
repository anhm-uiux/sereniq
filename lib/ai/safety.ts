/**
 * Lightweight, real safety guardrail.
 *
 * This is intentionally keyword-based rather than another LLM call:
 * - It's instant (no extra API latency/cost on every message).
 * - It still functions if both AI providers are down.
 * - It is a FLOOR, not a ceiling — the system prompts in prompts.ts also instruct
 *   the model to respond carefully to distress signals it detects on its own.
 *
 * This is a hackathon-scope guardrail, not a clinical-grade crisis detection system.
 * Do not present it as more than that in a demo.
 */

const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill myself|end my life|end it all|suicid\w*)\b/i,
  /\b(want to die|don'?t want to (live|be alive)|no reason to live)\b/i,
  /\b(self[\s-]?harm|cutting myself|hurt myself)\b/i,
  /\b(can'?t go on|nothing matters anymore|better off dead|give up on (life|everything))\b/i,
];

export interface SafetyCheckResult {
  flagged: boolean;
  reason?: string;
}

export function checkSafety(text: string): SafetyCheckResult {
  if (!text || text.trim().length === 0) {
    return { flagged: false };
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, reason: 'crisis-language-detected' };
    }
  }

  return { flagged: false };
}
