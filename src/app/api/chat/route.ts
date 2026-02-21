import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt } from '@/lib/chat-prompt';
import { chatRequestSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { messages, data } = parsed.data;

    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: buildSystemPrompt(data as Parameters<typeof buildSystemPrompt>[0]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: await convertToModelMessages(messages as any),
      maxOutputTokens: 1024,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('POST /api/chat error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
