export interface JournalEntry {
  id: string;
  user_id: string;
  mood_score: number;
  content: string;
  ai_summary: string | null;
  ai_triggers: string[] | null;
  ai_emotion_tags: string[] | null;
  flagged_for_safety: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  flagged_for_safety: boolean;
  created_at: string;
}

// Consistent error shape returned by every API route — never a raw stack trace.
export interface ApiErrorResponse {
  error: string;
}
