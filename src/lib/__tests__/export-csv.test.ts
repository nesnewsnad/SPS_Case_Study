import { describe, it, expect } from 'vitest';
import { formatCsvContent } from '@/lib/export-csv';

describe('formatCsvContent', () => {
  it('renders metadata header with # prefix', () => {
    const result = formatCsvContent({
      title: 'Executive Overview',
      filters: 'state=CA',
      entity: 'Pharmacy A',
      sections: [],
    });
    expect(result).toContain('# SPS Health — Executive Overview Export');
    expect(result).toContain('# Filters: state=CA');
    expect(result).toContain('# Entity: Pharmacy A');
    expect(result).toMatch(/^# Date: \d{4}-\d{2}-\d{2}/m);
  });

  it('shows "None" when no filters active', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [],
    });
    expect(result).toContain('# Filters: None');
  });

  it('renders a single section with headers and rows', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'KPI Summary',
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Claims', '546,523'],
            ['Net Claims', '428,886'],
          ],
        },
      ],
    });
    expect(result).toContain('KPI Summary');
    expect(result).toContain('"Metric","Value"');
    expect(result).toContain('"Total Claims","546,523"');
    expect(result).toContain('"Net Claims","428,886"');
  });

  it('separates multiple sections with blank lines', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        { heading: 'Section A', headers: ['A'], rows: [['1']] },
        { heading: 'Section B', headers: ['B'], rows: [['2']] },
      ],
    });
    const lines = result.split('\n');
    // Find blank line between sections
    const sectionBIdx = lines.findIndex((l) => l === 'Section B');
    expect(lines[sectionBIdx - 1]).toBe('');
  });

  it('escapes values containing commas', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'Test',
          headers: ['Name'],
          rows: [['Hydrocodone-APAP, 5-325mg']],
        },
      ],
    });
    expect(result).toContain('"Hydrocodone-APAP, 5-325mg"');
  });

  it('escapes values containing double quotes', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'Test',
          headers: ['Name'],
          rows: [['Drug "Special"']],
        },
      ],
    });
    expect(result).toContain('"Drug ""Special"""');
  });
});
