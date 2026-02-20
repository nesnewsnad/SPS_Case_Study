import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  date,
  integer,
  smallint,
  timestamp,
  index,
  char,
} from "drizzle-orm/pg-core";

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drugInfo = pgTable(
  "drug_info",
  {
    ndc: varchar("ndc", { length: 20 }).primaryKey(),
    drugName: varchar("drug_name", { length: 255 }),
    labelName: text("label_name"),
    mony: char("mony", { length: 1 }), // M, O, N, Y
    manufacturerName: varchar("manufacturer_name", { length: 255 }),
  },
  (table) => [
    index("idx_drug_mony").on(table.mony),
    index("idx_drug_manufacturer").on(table.manufacturerName),
    index("idx_drug_name").on(table.drugName),
  ]
);

export const claims = pgTable(
  "claims",
  {
    id: serial("id").primaryKey(),
    entityId: integer("entity_id")
      .notNull()
      .references(() => entities.id),
    adjudicated: boolean("adjudicated"),
    formulary: varchar("formulary", { length: 20 }), // OPEN, MANAGED, HMF
    dateFilled: date("date_filled"),
    ndc: varchar("ndc", { length: 20 }), // No FK — 30 claim NDCs don't exist in drug_info (0.05%)
    daysSupply: integer("days_supply"),
    groupId: varchar("group_id", { length: 50 }),
    pharmacyState: char("pharmacy_state", { length: 2 }),
    mailRetail: char("mail_retail", { length: 1 }), // M or R
    netClaimCount: smallint("net_claim_count"), // +1 or -1
  },
  (table) => [
    index("idx_claims_entity").on(table.entityId),
    index("idx_claims_date").on(table.dateFilled),
    index("idx_claims_state").on(table.pharmacyState),
    index("idx_claims_formulary").on(table.formulary),
    index("idx_claims_ndc").on(table.ndc),
    index("idx_claims_group").on(table.groupId),
    index("idx_claims_adjudicated").on(table.adjudicated),
    // Composite index for common filter combinations
    index("idx_claims_entity_date").on(table.entityId, table.dateFilled),
    index("idx_claims_entity_state").on(table.entityId, table.pharmacyState),
  ]
);
