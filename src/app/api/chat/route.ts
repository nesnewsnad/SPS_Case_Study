import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt } from '@/lib/chat-prompt';

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, data } = body;

  const result = streamText({
    model: anthropic('claude-3-5-haiku-latest'),
    system: buildSystemPrompt(data),
    messages,
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
