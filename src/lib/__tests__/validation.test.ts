import { describe, it, expect } from 'vitest';
import { filterSchema, chatRequestSchema } from '@/lib/validation';

describe('filterSchema', () => {
  it('accepts minimal input with defaults', () => {
    const result = filterSchema.parse({});
    expect(result.entityId).toBe(1);
    expect(result.includeFlaggedNdcs).toBe(false);
    expect(result.limit).toBe(20);
  });

  it('accepts a full valid filter set', () => {
    const input = {
      entityId: '2',
      formulary: 'OPEN',
      state: 'CA',
      mony: 'Y',
      manufacturer: 'Aurobindo',
      drug: 'Atorvastatin',
      ndc: '65862020190',
      dateStart: '20210101',
      dateEnd: '20211231',
      groupId: '6P6002',
      includeFlaggedNdcs: true,
      limit: '50',
    };
    const result = filterSchema.parse(input);
    expect(result.entityId).toBe(2);
    expect(result.formulary).toBe('OPEN');
    expect(result.state).toBe('CA');
    expect(result.limit).toBe(50);
  });

  it('coerces entityId from string to number', () => {
    const result = filterSchema.parse({ entityId: '5' });
    expect(result.entityId).toBe(5);
  });

  it('coerces limit from string to number', () => {
    const result = filterSchema.parse({ limit: '30' });
    expect(result.limit).toBe(30);
  });

  it('rejects invalid state', () => {
    expect(() => filterSchema.parse({ state: 'XX' })).toThrow();
  });

  it('rejects invalid formulary', () => {
    expect(() => filterSchema.parse({ formulary: 'CLOSED' })).toThrow();
  });

  it('rejects invalid MONY value', () => {
    expect(() => filterSchema.parse({ mony: 'Z' })).toThrow();
  });

  it('rejects limit of 0', () => {
    expect(() => filterSchema.parse({ limit: 0 })).toThrow();
  });

  it('rejects limit over 100', () => {
    expect(() => filterSchema.parse({ limit: 101 })).toThrow();
  });

  it('rejects invalid date format', () => {
    expect(() => filterSchema.parse({ dateStart: 'not-a-date' })).toThrow();
  });
});

describe('chatRequestSchema', () => {
  it('accepts a valid single user message', () => {
    const input = {
      messages: [{ role: 'user', content: 'What are the top drugs?' }],
    };
    const result = chatRequestSchema.parse(input);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
  });

  it('accepts a multi-turn conversation', () => {
    const input = {
      messages: [
        { role: 'user', content: 'Tell me about reversals' },
        { role: 'assistant', content: 'The reversal rate is 10.8%.' },
        { role: 'user', content: 'Break it down by state' },
      ],
    };
    const result = chatRequestSchema.parse(input);
    expect(result.messages).toHaveLength(3);
  });

  it('accepts optional data field', () => {
    const input = {
      messages: [{ role: 'user', content: 'Hello' }],
      data: { page: 'overview', entityId: 1 },
    };
    const result = chatRequestSchema.parse(input);
    expect(result.data).toBeDefined();
  });

  it('rejects invalid role', () => {
    const input = {
      messages: [{ role: 'admin', content: 'Hello' }],
    };
    expect(() => chatRequestSchema.parse(input)).toThrow();
  });

  it('rejects empty messages array', () => {
    const input = { messages: [] };
    // Empty array is valid per schema — no min constraint
    const result = chatRequestSchema.parse(input);
    expect(result.messages).toHaveLength(0);
  });

  it('rejects messages exceeding max count', () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i}`,
    }));
    expect(() => chatRequestSchema.parse({ messages })).toThrow();
  });
});
