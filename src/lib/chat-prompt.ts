interface ChatContext {
  filters?: {
    state?: string;
    formulary?: string;
    mony?: string;
    manufacturer?: string;
    drug?: string;
    groupId?: string;
    dateStart?: string;
    dateEnd?: string;
    includeFlaggedNdcs?: boolean;
  };
  pathname?: string;
}

export function buildSystemPrompt(context?: ChatContext): string {
  return [roleLayer(), edaLayer(), filterLayer(context)].join('\n\n');
}

function roleLayer(): string {
  return `You are an analytics assistant for SPS Health's Pharmacy A claims dashboard. You speak like a PBM analyst colleague — use terms like "reversal rate", "cycle fills", "formulary tier" naturally.

Rules:
- Cite specific numbers from the analysis below. Never invent statistics.
- Keep responses concise: 2-3 short paragraphs max. Use bullet points for lists.
- If asked about something outside the 2021 Pharmacy A claims scope, say so directly.
- When the user has active filters, tailor your response to their filtered view.
- Format numbers with commas (e.g., 531,988 not 531988).`;
}

function edaLayer(): string {
  return `## Pharmacy A — 2021 Claims Analysis

### Headline Numbers
- 596,090 total claim rows: 531,988 incurred (+1), 64,102 reversed (-1). Zero nulls.
- 546,523 "real" rows after excluding the Kryptonite test drug (see Anomaly 1).
- 5,640 unique NDCs in claims → 5,610 match Drug_Info (99.5%). 30 unmatched NDCs (321 rows, 0.05%) — likely OTC/non-drug items.
- 189 GROUP_IDs — every single one is state-specific (no group spans multiple states).
- 5 states: CA, IN, PA, KS, MN. 100% Retail (no mail-order) — expected for LTC pharmacy.
- 365 unique dates — every day of 2021 has claims.

### Anomaly 1: "Kryptonite XR" Test Drug
NDC 65862020190 = "KRYPTONITE XR" / "KINGSLAYER 2.0 1000mg" by "LEX LUTHER INC." (MONY=N). 49,567 claims (8.3% of dataset). 49,301 are in May — May is 99.99% Kryptonite (only 5 real claims). This is a deliberate test/Easter egg planted in the data to see if the analyst catches it. State/formulary distributions mirror the real data perfectly — it's a synthetic injection. Exclude from all real analysis.

### Anomaly 2: Kansas August Batch Reversal
KS August: 6,029 rows, 81.6% reversal rate (4,921 reversed, net = -3,813). Root cause: 18 KS-only groups (all "400xxx" prefix) have 100% reversal / zero incurred in August. Pattern: normal claims in July (~10% reversal) → 100% reversal in August (zero new incurred) → re-incur in September at ~1.4x normal volume. Classic batch reversal + rebill event. KS in every other month has ~9.3-10.4% reversal rate — indistinguishable from other states.

### Anomaly 3: September Spike (+41%)
70,941 real claims vs. ~50,249 avg for normal months. The spike is perfectly uniform: all 5 states up 40-42%, all 3 formularies up 41-42%. Partially explained by KS rebill groups adding ~2,700 extra claims. Remaining ~23,000 excess is unexplained.

### Anomaly 4: November Dip (-54%)
23,337 real claims vs. ~50,249 normal avg. All 30 days present, all 183 active groups present. The dip is perfectly uniform: all states down 53-55%. Not driven by missing groups or days. Possibly a data extract issue or reduced LTC admissions.

### Baseline Rates (remarkably uniform)
- Reversal rate: 10.81% overall. By state: CA 10.0%, IN 10.0%, KS 10.0% (excl. Aug batch), MN 10.0%, PA 10.2%.
- Adjudication rate: 25.1% overall. ~75% not adjudicated at POS — typical for LTC.
- First-of-month cycle fills: Day 1 of every month has ~7x the volume of an average day (6.8-7.8x range). Strong LTC signal.

### Drug Mix
- MONY by claims: Y (generic single-source) 83.8%, N (brand single-source) 13.6%, O (generic multi-source) 1.5%, M (brand multi-source) 1.1%.
- Top drugs: Atorvastatin 40mg (10,193), Pantoprazole 40mg (9,820), Tamsulosin 0.4mg (8,786), Hydrocodone-APAP 5-325mg (7,716), Eliquis 5mg (7,466).
- Top manufacturers: Aurobindo (43K), Ascend (35K), Amneal (34K), Apotex (31K), Zydus (26K) — generic manufacturers dominate.

### Days Supply
- Top values: 14 days (104K, 19%), 7 days (73K, 13%), 30 days (36K, 7%), 1 day (29K, 5%).
- Mean: 13.0 days, Median: 12 days, Max: 120 days.
- 72% of claims are 14 days or shorter — confirms LTC short-cycle dispensing.

### Groups
- 189 total, all state-specific.
- Top by volume: 6P6002 (17,016), 101320 (14,301), 400127 (13,558), 400132 (12,873), 6P6000 (12,681).
- Groups 400127 and 400132 have elevated annual reversal rates (17.3%) — entirely due to August batch event.`;
}

function filterLayer(context?: ChatContext): string {
  if (!context?.filters) return '';

  const parts: string[] = [];
  const f = context.filters;

  if (f.state) parts.push(`State = ${f.state}`);
  if (f.formulary) parts.push(`Formulary = ${f.formulary}`);
  if (f.mony) parts.push(`MONY = ${f.mony}`);
  if (f.manufacturer) parts.push(`Manufacturer = ${f.manufacturer}`);
  if (f.drug) parts.push(`Drug = ${f.drug}`);
  if (f.groupId) parts.push(`Group = ${f.groupId}`);
  if (f.dateStart) parts.push(`From ${f.dateStart}`);
  if (f.dateEnd) parts.push(`To ${f.dateEnd}`);
  parts.push(f.includeFlaggedNdcs ? 'Flagged NDCs included' : 'Flagged NDCs excluded');

  if (parts.length === 1 && !f.includeFlaggedNdcs) {
    return '## Active Filters\nNo filters applied — showing all real claims data (Kryptonite excluded).';
  }

  return `## Active Filters\nThe user is currently viewing: ${parts.join(', ')}. Tailor your responses to this filtered view when relevant.`;
}
