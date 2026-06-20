import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Provider layer — deliberately thin for sprint scope.
 * One function per provider, one shared interface, simple try/catch fallback
 * in the layer above (insight.ts / chat.ts). No retry/backoff/circuit-breaker
 * machinery here — that's the right call for a multi-day build, not a few-hour one.
 */

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content');
  }
  return textBlock.text;
}

export async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  if (!text) {
    throw new Error('Gemini returned no text content');
  }
  return text;
}

/**
 * Tries Claude first, falls back to Gemini on any failure.
 * Throws only if BOTH providers fail — caller should catch and return
 * a clean error to the client rather than a raw stack trace.
 */
export async function callWithFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    return await callClaude(systemPrompt, userPrompt);
  } catch (claudeError) {
    console.error('[ai/provider] Claude call failed, falling back to Gemini:', claudeError);
    try {
      return await callGemini(systemPrompt, userPrompt);
    } catch (geminiError) {
      console.error('[ai/provider] Gemini fallback also failed:', geminiError);
      throw new Error('Both AI providers failed to respond');
    }
  }
}
