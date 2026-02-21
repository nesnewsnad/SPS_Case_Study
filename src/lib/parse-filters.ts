import { filterSchema } from './validation';
import type { FilterParams } from './api-types';

export function parseFilters(searchParams: URLSearchParams): FilterParams {
  const raw = {
    entityId: searchParams.get('entityId') ?? undefined,
    formulary: searchParams.get('formulary') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    mony: searchParams.get('mony') ?? undefined,
    manufacturer: searchParams.get('manufacturer') ?? undefined,
    drug: searchParams.get('drug') ?? undefined,
    ndc: searchParams.get('ndc') ?? undefined,
    dateStart: searchParams.get('dateStart') ?? undefined,
    dateEnd: searchParams.get('dateEnd') ?? undefined,
    groupId: searchParams.get('groupId') ?? undefined,
    includeFlaggedNdcs: searchParams.get('flagged') === 'true',
    limit: searchParams.get('limit') ?? undefined,
  };

  // Strip undefined values so Zod defaults kick in
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));

  const parsed = filterSchema.safeParse(cleaned);

  if (!parsed.success) {
    // Fall back to safe defaults on invalid input — don't crash the route
    console.warn('[validation] Invalid filter params:', parsed.error.flatten().fieldErrors);
    return { entityId: 1, includeFlaggedNdcs: false };
  }

  return {
    entityId: parsed.data.entityId,
    formulary: parsed.data.formulary,
    state: parsed.data.state,
    mony: parsed.data.mony,
    manufacturer: parsed.data.manufacturer,
    drug: parsed.data.drug,
    ndc: parsed.data.ndc,
    dateStart: parsed.data.dateStart,
    dateEnd: parsed.data.dateEnd,
    groupId: parsed.data.groupId,
    includeFlaggedNdcs: parsed.data.includeFlaggedNdcs,
  };
}
