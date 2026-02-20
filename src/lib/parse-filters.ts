import type { FilterParams } from './api-types';

export function parseFilters(searchParams: URLSearchParams): FilterParams {
  return {
    entityId: Number(searchParams.get('entityId')) || 1,
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
  };
}
