// Unified filter params (parsed from query string)
export interface FilterParams {
  entityId: number;
  formulary?: string;
  state?: string;
  mony?: string;
  manufacturer?: string;
  drug?: string;
  ndc?: string;
  dateStart?: string;
  dateEnd?: string;
  groupId?: string;
  includeFlaggedNdcs?: boolean;
}

export const FLAGGED_NDCS: { ndc: string; label: string; reason: string }[] = [
  { ndc: '65862020190', label: 'KRYPTONITE XR (LEX LUTHER INC.)', reason: 'Synthetic test drug — 49,567 claims, 99.5% in May' }
];

export interface KpiSummary {
  totalClaims: number;
  netClaims: number;
  reversalRate: number;
  uniqueDrugs: number;
}

export interface MonthlyDataPoint {
  month: string;
  incurred: number;
  reversed: number;
}

export interface FormularyBreakdown {
  type: string;
  netClaims: number;
  reversalRate: number;
}

export interface StateBreakdown {
  state: string;
  netClaims: number;
  totalClaims: number;
  reversalRate: number;
}

export interface AdjudicationSummary {
  adjudicated: number;
  notAdjudicated: number;
  rate: number;
}

export interface OverviewResponse {
  kpis: KpiSummary;
  unfilteredKpis: KpiSummary;
  monthly: MonthlyDataPoint[];
  formulary: FormularyBreakdown[];
  states: StateBreakdown[];
  adjudication: AdjudicationSummary;
}

export interface DrugRow {
  drugName: string;
  ndc: string;
  netClaims: number;
  reversalRate: number;
  formulary: string;
  topState: string;
}

export interface DaysSupplyBin {
  bin: string;
  count: number;
}

export interface MonyBreakdown {
  type: string;
  netClaims: number;
}

export interface GroupVolume {
  groupId: string;
  netClaims: number;
}

export interface ManufacturerVolume {
  manufacturer: string;
  netClaims: number;
}

export interface ClaimsResponse {
  kpis: KpiSummary;
  unfilteredKpis: KpiSummary;
  monthly: MonthlyDataPoint[];
  drugs: DrugRow[];
  daysSupply: DaysSupplyBin[];
  mony: MonyBreakdown[];
  topGroups: GroupVolume[];
  topManufacturers: ManufacturerVolume[];
}

export interface BeforeAfterMetric {
  metric: string;
  withFlagged: string;
  withoutFlagged: string;
}

export interface AnomalyPanel {
  id: string;
  title: string;
  keyStat: string;
  whatWeSee: string;
  whyItMatters: string;
  toConfirm: string;
  rfpImpact: string;
  miniCharts: AnomalyMiniChart[];
  beforeAfter?: BeforeAfterMetric[];
}

export interface AnomalyMiniChart {
  title: string;
  type: "grouped-bar" | "stacked-bar" | "bar";
  data: Record<string, number | string>[];
}

export interface AnomaliesResponse {
  panels: AnomalyPanel[];
}

export interface FiltersResponse {
  drugs: string[];
  manufacturers: string[];
  groups: string[];
}

export interface Entity {
  id: number;
  name: string;
  description: string | null;
}

export interface EntitiesResponse {
  entities: Entity[];
}
