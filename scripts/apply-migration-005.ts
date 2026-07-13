/**
 * apply-migration-005.ts
 * Applies the enterprise tables migration that was never run on the database.
 * Uses Supabase Management API (requires SUPABASE_ACCESS_TOKEN from dashboard).
 *
 * Alternative: paste the SQL into Supabase Dashboard > SQL Editor and run manually.
 */
import * as fs from "fs"
import * as path from "path"

const envPath = path.resolve(__dirname, "..", ".env.local")
const envRaw = fs.readFileSync(envPath, "utf-8")
const env: Record<string, string> = {}
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase/)?.[1]
console.log(`Project ref: ${projectRef}`)
console.log(`URL: ${SUPABASE_URL}`)

async function main() {
  // Read the migration SQL
  const sqlPath = path.resolve(__dirname, "..", "supabase", "migrations", "005_enterprise_tables.sql")
  const sql = fs.readFileSync(sqlPath, "utf-8")

  console.log(`\nMigration SQL length: ${sql.length} chars`)
  console.log("\n⚠️  This migration needs to be applied via Supabase Dashboard SQL Editor.")
  console.log("    Go to: https://supabase.com/dashboard/project/_/sql/new")
  console.log("    Paste the SQL below and click 'Run'.\n")
  console.log("--- SQL START ---")
  console.log(sql)
  console.log("--- SQL END ---")

  // Try to apply via Management API (requires access token)
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (accessToken) {
    console.log("\nAttempting via Management API...")
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    })
    const result = await res.json()
    console.log("Result:", JSON.stringify(result, null, 2))
  } else {
    console.log("\nNo SUPABASE_ACCESS_TOKEN found. Apply SQL manually via Dashboard.")
  }
}

main()
