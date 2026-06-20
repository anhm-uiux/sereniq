import { z } from 'zod';

/**
 * Every API route validates input against one of these before touching
 * the database or making an AI call. This is cheap insurance against
 * malformed data, oversized payloads, and basic injection attempts.
 */

export const analyzeRequestSchema = z.object({
  journalText: z.string().min(1, 'Journal entry cannot be empty').max(5000, 'Entry too long'),
  moodScore: z.number().int().min(1).max(5),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
