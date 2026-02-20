import { and, eq, gte, lte, notInArray, SQL } from 'drizzle-orm';
import { claims, drugInfo } from '@/db/schema';
import type { FilterParams } from './api-types';
import { FLAGGED_NDCS } from './api-types';

export interface WhereResult {
  where: SQL | undefined;
  needsJoin: boolean;
}

export function buildWhereClause(filters: FilterParams): WhereResult {
  const conditions: SQL[] = [];
  let needsJoin = false;

  // Always scope by entity
  conditions.push(eq(claims.entityId, filters.entityId));

  // Flagged NDC exclusion (default: exclude)
  if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
    conditions.push(
      notInArray(
        claims.ndc,
        FLAGGED_NDCS.map((f) => f.ndc),
      ),
    );
  }

  // Claims-table filters
  if (filters.formulary) conditions.push(eq(claims.formulary, filters.formulary));
  if (filters.state) conditions.push(eq(claims.pharmacyState, filters.state));
  if (filters.groupId) conditions.push(eq(claims.groupId, filters.groupId));
  if (filters.ndc) conditions.push(eq(claims.ndc, filters.ndc));
  if (filters.dateStart) conditions.push(gte(claims.dateFilled, filters.dateStart));
  if (filters.dateEnd) conditions.push(lte(claims.dateFilled, filters.dateEnd));

  // Drug-info filters (require JOIN)
  if (filters.mony) {
    needsJoin = true;
    conditions.push(eq(drugInfo.mony, filters.mony));
  }
  if (filters.manufacturer) {
    needsJoin = true;
    conditions.push(eq(drugInfo.manufacturerName, filters.manufacturer));
  }
  if (filters.drug) {
    needsJoin = true;
    conditions.push(eq(drugInfo.drugName, filters.drug));
  }

  return {
    where: conditions.length > 0 ? and(...conditions) : undefined,
    needsJoin,
  };
}
