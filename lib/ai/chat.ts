import { callWithFallback } from './provider';
import { CHAT_SYSTEM_PROMPT, SAFE_FALLBACK_RESPONSE, buildChatUserPrompt } from './prompts';
import { checkSafety } from './safety';

export interface RecentJournalContext {
  summary: string;
  emotionTags: string[];
  createdAt: string;
}

export interface ChatReplyResult {
  reply: string;
  flaggedForSafety: boolean;
}

export async function generateChatReply(
  userMessage: string,
  recentContext: RecentJournalContext[]
): Promise<ChatReplyResult> {
  // Checkpoint 1: check the user's message BEFORE spending an LLM call.
  const inputSafety = checkSafety(userMessage);
  if (inputSafety.flagged) {
    return { reply: SAFE_FALLBACK_RESPONSE, flaggedForSafety: true };
  }

  const userPrompt = buildChatUserPrompt(userMessage, recentContext);
  const reply = await callWithFallback(CHAT_SYSTEM_PROMPT, userPrompt);

  // Checkpoint 2: check the MODEL'S reply before it ever reaches the user.
  // The model is instructed to handle distress carefully, but this is a backstop
  // in case it still produces something that reads as crisis-adjacent without
  // properly redirecting to help.
  const outputSafety = checkSafety(reply);
  if (outputSafety.flagged) {
    return { reply: SAFE_FALLBACK_RESPONSE, flaggedForSafety: true };
  }

  return { reply, flaggedForSafety: false };
}
