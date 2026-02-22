'use client';

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Send, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';
import { useFilters } from '@/contexts/filter-context';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SUGGESTIONS: Record<string, string[]> = {
  '/': [
    "What's driving the monthly volume swings?",
    'Why is adjudication so low?',
    'How does our generic rate compare to industry?',
  ],
  '/explorer': [
    'Which drugs have the highest reversal rates?',
    'Why are days supply so short?',
    'What do the top manufacturers tell us?',
  ],
  '/anomalies': [
    'Explain the Kryptonite test drug',
    'What caused the Kansas August event?',
    'Is the September spike real?',
  ],
  '/process': [
    'How did you validate the anomalies?',
    'What would you do differently?',
    'How was the data cleaned?',
  ],
};

const FOLLOW_UPS: Record<string, string[]> = {
  '/': [
    'Break down claims by state',
    'What does the drug mix tell us about this population?',
    'Explain the cycle-fill pattern',
    'How does November compare to normal months?',
    'Tell me about the top manufacturers',
  ],
  '/explorer': [
    'Why is Eliquis the only brand in the top 10?',
    'What do group prefixes tell us about state mapping?',
    'Compare the top 5 drugs by volume',
    'Explain the MONY distribution',
    'Which groups are affected by the KS batch reversal?',
  ],
  '/anomalies': [
    'How confident are you in each anomaly?',
    'What does semi-synthetic data mean for the analysis?',
    'Walk me through the KS batch reversal timeline',
    'Could the September spike be real or is it synthetic?',
    'What COVID context explains these patterns?',
  ],
  '/process': [
    'What bugs did spec-check catch?',
    'How does writer/reviewer separation work?',
    'Explain the context layer',
    'Why not use Streamlit or static HTML?',
    'How many tests cover this dashboard?',
  ],
};

function getSuggestions(pathname: string): string[] {
  return SUGGESTIONS[pathname] || SUGGESTIONS['/'];
}

function getFollowUps(pathname: string, messageCount: number): string[] {
  const pool = FOLLOW_UPS[pathname] || FOLLOW_UPS['/'];
  // Rotate through the pool based on conversation length so follow-ups evolve
  const offset = Math.floor(messageCount / 2) % pool.length;
  return [pool[offset % pool.length], pool[(offset + 1) % pool.length]];
}

/** Extract plain text from a UIMessage's parts array. */
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

const MONY_SHORT: Record<string, string> = {
  M: 'Brand Multi',
  O: 'Generic Multi',
  N: 'Brand Single',
  Y: 'Generic Single',
};

function FilterContextBadge({
  filters,
}: {
  filters: {
    state?: string;
    formulary?: string;
    mony?: string;
    drug?: string;
    manufacturer?: string;
    groupId?: string;
  };
}) {
  const parts: string[] = [];
  if (filters.state) parts.push(filters.state);
  if (filters.formulary) parts.push(filters.formulary);
  if (filters.mony) parts.push(MONY_SHORT[filters.mony] ?? filters.mony);
  if (filters.drug) parts.push(filters.drug);
  if (filters.manufacturer) parts.push(filters.manufacturer);
  if (filters.groupId) parts.push(`Group ${filters.groupId}`);

  if (parts.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 pt-1">
      <span className="text-muted-foreground text-[10px] tracking-wider uppercase">Viewing</span>
      <div className="flex flex-wrap gap-1">
        {parts.map((part) => (
          <span
            key={part}
            className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700"
          >
            {part}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const pathname = usePathname();
  const { filters } = useFilters();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable transport — dynamic filter data is sent per-request via sendMessage options
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);

  const { messages, setMessages, sendMessage, status, error: chatError } = useChat({ transport });

  const isBusy = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Re-focus input after AI finishes responding
  useEffect(() => {
    if (!isBusy && open) {
      inputRef.current?.focus();
    }
  }, [isBusy, open]);

  const handleSend = (text: string) => {
    if (!text.trim() || isBusy) return;
    setInput('');
    sendMessage(
      { text },
      {
        body: {
          data: {
            filters: {
              state: filters.state,
              formulary: filters.formulary,
              mony: filters.mony,
              manufacturer: filters.manufacturer,
              drug: filters.drug,
              groupId: filters.groupId,
              dateStart: filters.dateStart,
              dateEnd: filters.dateEnd,
              includeFlaggedNdcs: filters.includeFlaggedNdcs,
            },
            pathname,
          },
        },
      },
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const suggestions = getSuggestions(pathname);
  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating Action Button — always mounted, animated in/out */}
      <button
        onClick={() => setOpen(true)}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        className={cn(
          'fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300',
          'bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-[0_4px_14px_-3px_rgba(13,148,136,0.5)]',
          open
            ? 'pointer-events-none scale-75 opacity-0'
            : 'scale-100 opacity-100 hover:scale-105 hover:shadow-[0_6px_20px_-3px_rgba(13,148,136,0.6)]',
          !hasMessages && !open && 'animate-pulse',
        )}
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Sheet — non-modal so dashboard stays interactive */}
      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
          side="right"
          showCloseButton={false}
          overlay={false}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="border-border/40 !inset-y-auto !right-0 !bottom-0 flex !h-[calc(100dvh-3.5rem)] w-full flex-col gap-0 rounded-tl-xl border-t border-l p-0 shadow-[-4px_-4px_24px_-6px_rgba(0,0,0,0.1)] sm:!h-[calc(100dvh-5rem)] sm:max-w-md"
        >
          {/* Mobile drag handle — tap to collapse */}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center py-2 sm:hidden"
            aria-label="Collapse chat"
          >
            <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
          </button>

          {/* Header */}
          <SheetHeader className="border-b px-4 py-3 pt-0 sm:pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                <SheetTitle className="text-base">Ask the Data</SheetTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Powered by Claude
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <button
                    onClick={() => setMessages([])}
                    className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
                    aria-label="New conversation"
                    title="New conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
                  aria-label="Collapse chat"
                  title="Collapse"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Filter context badge */}
            <FilterContextBadge filters={filters} />
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!hasMessages ? (
              /* Welcome State */
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 p-5">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600" />
                  <p className="text-sm font-semibold tracking-tight">
                    Ask me anything about Pharmacy A&apos;s 2021 claims data.
                  </p>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    I know the anomalies, drug mix, reversal patterns, and seasonal trends.
                    Filter-aware — I&apos;ll reference your current view and active filters.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Try asking
                  </p>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      disabled={isBusy}
                      className="text-muted-foreground hover:text-foreground border-border/60 block w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:border-teal-200 hover:bg-teal-50/50 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className="space-y-4" aria-live="polite">
                {messages.map((message) => {
                  const text = getMessageText(message);
                  if (!text) return null;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        message.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted',
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            {text.split('\n').map((line: string, i: number) => {
                              if (!line.trim()) return <br key={i} />;
                              const formatted = line.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong>$1</strong>',
                              );
                              // Markdown headers → bold text with appropriate size
                              const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
                              if (headerMatch) {
                                const level = headerMatch[1].length;
                                const headerText = headerMatch[2].replace(
                                  /\*\*(.*?)\*\*/g,
                                  '<strong>$1</strong>',
                                );
                                const cls =
                                  level === 1
                                    ? 'font-semibold text-sm pt-2'
                                    : level === 2
                                      ? 'font-semibold text-sm pt-1.5'
                                      : 'font-medium text-sm pt-1';
                                return (
                                  <p
                                    key={i}
                                    className={cls}
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(headerText),
                                    }}
                                  />
                                );
                              }
                              if (line.trim().startsWith('- ')) {
                                return (
                                  <div key={i} className="flex gap-1.5 py-0.5">
                                    <span className="text-muted-foreground mt-0.5 shrink-0">
                                      &bull;
                                    </span>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(formatted.replace(/^- /, '')),
                                      }}
                                    />
                                  </div>
                                );
                              }
                              // Numbered lists (1. 2. 3. etc.)
                              const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
                              if (numberedMatch) {
                                const numFormatted = numberedMatch[2].replace(
                                  /\*\*(.*?)\*\*/g,
                                  '<strong>$1</strong>',
                                );
                                return (
                                  <div key={i} className="flex gap-1.5 py-0.5">
                                    <span className="text-muted-foreground mt-0.5 w-4 shrink-0 text-right text-xs">
                                      {numberedMatch[1]}.
                                    </span>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(numFormatted),
                                      }}
                                    />
                                  </div>
                                );
                              }
                              return (
                                <p
                                  key={i}
                                  className="py-0.5"
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(formatted),
                                  }}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <p>{text}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {status === 'submitted' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <span className="text-muted-foreground animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
                {chatError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <p>Something went wrong. Try sending your message again.</p>
                    <button
                      onClick={() => {
                        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUserMsg) {
                          const text = getMessageText(lastUserMsg);
                          if (text) handleSend(text);
                        }
                      }}
                      className="mt-1.5 text-xs font-medium text-red-800 underline underline-offset-2 hover:text-red-900"
                    >
                      Retry last message
                    </button>
                  </div>
                )}
                {/* Follow-up suggestions — shown when AI is done responding */}
                {!isBusy &&
                  !chatError &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === 'assistant' && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {getFollowUps(pathname, messages.length).map((followUp) => (
                        <button
                          key={followUp}
                          onClick={() => handleSend(followUp)}
                          className="text-muted-foreground hover:text-foreground border-border/60 rounded-full border px-3 py-1.5 text-xs transition-all hover:border-teal-200 hover:bg-teal-50/50"
                        >
                          {followUp}
                        </button>
                      ))}
                    </div>
                  )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about claims, drugs, anomalies..."
                disabled={isBusy}
                className="bg-muted flex-1 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-xs focus:border-teal-300 focus:ring-1 focus:ring-teal-200/50 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isBusy || !input.trim()}
                className="h-9 w-9 shrink-0 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
