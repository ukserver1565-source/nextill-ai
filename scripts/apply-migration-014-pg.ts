/**
 * apply-migration-014-pg.ts
 * Attempts to apply migration via direct Postgres connection using pg.
 * Requires DATABASE_URL environment variable or constructs from Supabase settings.
 */
import { Client } from "pg"
import * as fs from "fs"
import * as path from "path"

// Load env
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

// Try DATABASE_URL first, then construct from Supabase project details
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL

async function main() {
  if (!databaseUrl) {
    console.log("No DATABASE_URL found.")
    console.log("To run this migration, you need the direct database connection string.")
    console.log("\nGet it from: https://supabase.com/dashboard/project/vsapklipfevnwwsuhkai/settings/database")
    console.log('Look for "Connection string" > "URI" under Transaction mode or Session mode.\n')
    console.log("Then run:")
    console.log('  DATABASE_URL="postgresql://..." npx tsx scripts/apply-migration-014-pg.ts')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    console.log("Connected to database.\n")

    // Read migration SQL
    const sqlPath = path.resolve(__dirname, "..", "supabase", "migrations", "014_blog_and_tool_status_columns.sql")
    const sql = fs.readFileSync(sqlPath, "utf-8")

    // Execute each statement separately
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))

    for (const stmt of statements) {
      const preview = stmt.substring(0, 80).replace(/\n/g, " ")
      process.stdout.write(`  Running: ${preview}... `)
      try {
        await client.query(stmt)
        console.log("✅")
      } catch (err: any) {
        // "column already exists" is fine (idempotent)
        if (err.message?.includes("already exists")) {
          console.log("✅ (already exists)")
        } else {
          console.log(`❌ ${err.message}`)
        }
      }
    }

    // Verify
    console.log("\n--- Verifying columns ---")
    const blogCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'blog_posts' AND column_name IN ('featured_image_url', 'author_id', 'published_at', 'view_count')
    `)
    console.log(`blog_posts: ${blogCheck.rows.map(r => r.column_name).join(", ") || "none found"}`)

    const toolCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'workflow_settings' AND column_name IN ('status', 'api_verified', 'last_tested_at', 'last_test_result')
    `)
    console.log(`workflow_settings: ${toolCheck.rows.map(r => r.column_name).join(", ") || "none found"}`)

    if (blogCheck.rows.length === 4 && toolCheck.rows.length === 4) {
      console.log("\n✅ Migration applied successfully! All 8 columns verified.")
    } else {
      console.log("\n⚠️ Some columns may be missing. Check the output above.")
    }
  } catch (err) {
    console.error("Connection failed:", (err as Error).message)
  } finally {
    await client.end()
  }
}

main()
