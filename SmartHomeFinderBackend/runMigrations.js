import pool from "./src/config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env from Backend directory
dotenv.config({ path: "./.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  try {
    console.log("Starting migrations...");

    // Run all migrations in order
    const migrationFiles = [
      "000_create_properties_table.sql",
      "001_update_properties_table.sql",
      "002_create_media_table.sql",
      "003_add_admin_flags.sql",
      "004_create_admin_audit.sql",
      "005_rename_owner_to_landlord.sql",
      "006_allow_media_urls.sql",
      "007_add_admin_flags_if_missing.sql",
      "008_admin_audit_admin_id_integer.sql",
      "009_admin_audit_admin_id_integer.sql",
      "010_admin_audit_uuid_ids.sql",
      "011_add_user_phone.sql",
      "012_create_transactions.sql",
      "013_commission_settings.sql",
      "014_update_transactions_payment.sql",
      "015_add_user_bank_fields.sql",
      "016_add_paystack_customer_fields.sql",
      "017_create_wishlists.sql"
    ];

    for (const migrationFile of migrationFiles) {
      const filePath = path.join(__dirname, "migrations", migrationFile);
      console.log(`\n📋 Running migration: ${migrationFile}`);
      
      const sql = fs.readFileSync(filePath, "utf8");

      // Execute full file to preserve DO $$ blocks
      console.log("  ↳ Executing file as a single batch");
      await pool.query(sql);
    }

    console.log("\n✓ Migrations completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

runMigrations();
