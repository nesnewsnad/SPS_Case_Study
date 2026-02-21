import { describe, it, expect } from 'vitest';
import { parseFilters } from '@/lib/parse-filters';

describe('parseFilters', () => {
  it('returns defaults for empty params', () => {
    const result = parseFilters(new URLSearchParams());
    expect(result.entityId).toBe(1);
    expect(result.includeFlaggedNdcs).toBe(false);
    expect(result.state).toBeUndefined();
    expect(result.formulary).toBeUndefined();
    expect(result.mony).toBeUndefined();
    expect(result.manufacturer).toBeUndefined();
    expect(result.drug).toBeUndefined();
    expect(result.ndc).toBeUndefined();
    expect(result.dateStart).toBeUndefined();
    expect(result.dateEnd).toBeUndefined();
    expect(result.groupId).toBeUndefined();
  });

  it('parses entityId', () => {
    const result = parseFilters(new URLSearchParams('entityId=5'));
    expect(result.entityId).toBe(5);
  });

  it('falls back to 1 for non-numeric entityId', () => {
    const result = parseFilters(new URLSearchParams('entityId=abc'));
    expect(result.entityId).toBe(1);
  });

  it('falls back to 1 for missing entityId', () => {
    const result = parseFilters(new URLSearchParams('state=CA'));
    expect(result.entityId).toBe(1);
  });

  it('passes through state filter', () => {
    const result = parseFilters(new URLSearchParams('state=CA'));
    expect(result.state).toBe('CA');
  });

  it('passes through multiple filters', () => {
    const result = parseFilters(new URLSearchParams('formulary=OPEN&mony=Y'));
    expect(result.formulary).toBe('OPEN');
    expect(result.mony).toBe('Y');
  });

  it('passes through manufacturer and drug', () => {
    const result = parseFilters(new URLSearchParams('manufacturer=Aurobindo&drug=Atorvastatin'));
    expect(result.manufacturer).toBe('Aurobindo');
    expect(result.drug).toBe('Atorvastatin');
  });

  it('sets includeFlaggedNdcs true', () => {
    const result = parseFilters(new URLSearchParams('flagged=true'));
    expect(result.includeFlaggedNdcs).toBe(true);
  });

  it('sets includeFlaggedNdcs false explicitly', () => {
    const result = parseFilters(new URLSearchParams('flagged=false'));
    expect(result.includeFlaggedNdcs).toBe(false);
  });

  it('returns undefined not null for absent params', () => {
    const result = parseFilters(new URLSearchParams());
    // Verify these are undefined, not null or empty string
    expect(result.state).toBe(undefined);
    expect(result.drug).toBe(undefined);
    expect(result.dateStart).toBe(undefined);
  });
});
