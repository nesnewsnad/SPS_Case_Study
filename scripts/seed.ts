import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DATA_DIR = path.join(__dirname, "..", "Case Study - Data");
const BATCH_SIZE = 500; // Neon HTTP has payload limits — keep batches small

async function seedDrugInfo() {
  console.log("Seeding drug_info...");
  const raw = fs.readFileSync(path.join(DATA_DIR, "Drug_Info.csv"), "utf-8");
  const records = parse(raw, {
    delimiter: "~",
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`  Parsed ${records.length} drug records`);

  // Deduplicate by NDC (take first occurrence)
  const seen = new Set<string>();
  const unique: typeof records = [];
  for (const r of records) {
    const ndc = r.NDC?.trim();
    if (ndc && !seen.has(ndc)) {
      seen.add(ndc);
      unique.push(r);
    }
  }
  console.log(`  ${unique.length} unique NDCs after dedup`);

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE).map((r: Record<string, string>) => ({
      ndc: r.NDC?.trim(),
      drugName: r.DRUG_NAME?.trim() || null,
      labelName: r.LABEL_NAME?.trim() || null,
      mony: r.MONY?.trim() || null,
      manufacturerName: r.MANUFACTURER_NAME?.trim() || null,
    }));

    await db
      .insert(schema.drugInfo)
      .values(batch)
      .onConflictDoNothing();

    if ((i / BATCH_SIZE) % 20 === 0) {
      console.log(`  Inserted ${Math.min(i + BATCH_SIZE, unique.length)}/${unique.length} drugs`);
    }
  }
  console.log("  Drug info seeded.");
}

async function seedClaims(entityId: number) {
  console.log("Seeding claims...");
  // Read with utf-8-sig to handle BOM
  const rawBuffer = fs.readFileSync(path.join(DATA_DIR, "Claims_Export.csv"));
  // Strip BOM if present
  const raw =
    rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf
      ? rawBuffer.subarray(3).toString("utf-8")
      : rawBuffer.toString("utf-8");

  const records = parse(raw, {
    delimiter: "~",
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`  Parsed ${records.length} claim records`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE).map((r: Record<string, string>) => {
      // Parse YYYYMMDD date
      const dateStr = r.DATE_FILLED?.trim();
      let dateFilled: string | null = null;
      if (dateStr && dateStr.length === 8) {
        dateFilled = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      }

      return {
        entityId,
        adjudicated: r.ADJUDICATED?.trim().toLowerCase() === "true",
        formulary: r.FORMULARY?.trim() || null,
        dateFilled,
        ndc: r.NDC?.trim() || null,
        daysSupply: r.DAYS_SUPPLY ? parseInt(r.DAYS_SUPPLY.trim(), 10) : null,
        groupId: r.GROUP_ID?.trim() || null,
        pharmacyState: r.PHARMACY_STATE?.trim() || null,
        mailRetail: r.MAILRETAIL?.trim() || null,
        netClaimCount: r.NET_CLAIM_COUNT ? parseInt(r.NET_CLAIM_COUNT.trim(), 10) : null,
      };
    });

    await db.insert(schema.claims).values(batch);

    if ((i / BATCH_SIZE) % 100 === 0) {
      console.log(`  Inserted ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} claims`);
    }
  }
  console.log("  Claims seeded.");
}

async function main() {
  console.log("Starting seed...\n");

  // Create the entity for Pharmacy A
  console.log("Creating entity: Pharmacy A");
  const [entity] = await db
    .insert(schema.entities)
    .values({
      name: "Pharmacy A",
      description:
        "Prospective long-term care pharmacy client — 2021 claims data for RFP evaluation",
    })
    .returning();
  console.log(`  Entity created with id: ${entity.id}\n`);

  // Seed drug info first (reference table)
  await seedDrugInfo();
  console.log();

  // Seed claims
  await seedClaims(entity.id);

  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
