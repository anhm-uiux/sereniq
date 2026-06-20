/**
 * Provider layer - updated to route all calls through the Groq API
 * using the openai/gpt-oss-120b model as requested by the user.
 */

export async function callWithFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in .env.local');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[ai/provider] Groq API error response:', errorBody);
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned no text content');
  }

  return content;
}

export async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  return callWithFallback(systemPrompt, userPrompt);
}

export async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  return callWithFallback(systemPrompt, userPrompt);
}

