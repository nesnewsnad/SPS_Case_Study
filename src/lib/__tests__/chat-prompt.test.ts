import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/chat-prompt';

describe('buildSystemPrompt', () => {
  describe('without context', () => {
    it('includes role layer', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('analytics assistant');
      expect(prompt).toContain('reversal rate');
    });

    it('includes EDA layer headline numbers', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('596,090');
      expect(prompt).toContain('531,988');
    });

    it('includes Kryptonite anomaly', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Kryptonite');
      expect(prompt).toContain('KRYPTONITE XR');
    });

    it('includes Kansas August anomaly', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Kansas August');
      expect(prompt).toContain('batch reversal');
    });

    it('includes Cycle-Fill pattern', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Cycle-Fill');
    });

    it('includes Semi-Synthetic note', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Semi-Synthetic');
    });

    it('includes AI process layer', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('7-Stage Pipeline');
      expect(prompt).toContain('writer/reviewer separation');
      expect(prompt).toContain('97 acceptance criteria');
    });

    it('includes tech stack info', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Next.js 14');
      expect(prompt).toContain('Drizzle ORM');
      expect(prompt).toContain('Claude Code CLI');
    });

    it('includes honest limitations', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Context window is real');
      expect(prompt).toContain('Domain knowledge is borrowed');
    });

    it('does not include filter section when no context', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).not.toContain('Active Filters');
    });
  });

  describe('filter layer', () => {
    it('shows no filters applied when filters object is empty-ish', () => {
      const prompt = buildSystemPrompt({ filters: {} });
      expect(prompt).toContain('No filters applied');
    });

    it('includes state filter', () => {
      const prompt = buildSystemPrompt({ filters: { state: 'CA' } });
      expect(prompt).toContain('State = CA');
    });

    it('lists multiple filters', () => {
      const prompt = buildSystemPrompt({
        filters: { state: 'CA', formulary: 'OPEN', mony: 'Y' },
      });
      expect(prompt).toContain('State = CA');
      expect(prompt).toContain('Formulary = OPEN');
      expect(prompt).toContain('MONY = Y');
    });

    it('includes flagged NDCs text when true', () => {
      const prompt = buildSystemPrompt({ filters: { includeFlaggedNdcs: true } });
      expect(prompt).toContain('Flagged NDCs included');
    });

    it('shows no filters when only includeFlaggedNdcs is false', () => {
      const prompt = buildSystemPrompt({ filters: { includeFlaggedNdcs: false } });
      expect(prompt).toContain('No filters applied');
    });
  });
});
