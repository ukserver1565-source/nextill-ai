/**
 * try-apply-migration.ts
 * Tries multiple approaches to apply the migration to the live Supabase database.
 */
import { createClient } from "@supabase/supabase-js"
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const sqlPath = path.resolve(__dirname, "..", "supabase", "migrations", "014_blog_and_tool_status_columns.sql")
const sql = fs.readFileSync(sqlPath, "utf-8")

async function tryExecSql(): Promise<boolean> {
  console.log("Approach 1: Try supabase.rpc('exec_sql')...")
  try {
    const { data, error } = await supabase.rpc("exec_sql", { query: sql })
    if (error) {
      console.log(`  Failed: ${error.message}`)
      return false
    }
    console.log(`  Success! Result: ${JSON.stringify(data)}`)
    return true
  } catch (e) {
    console.log(`  Failed: ${(e as Error).message}`)
    return false
  }
}

async function tryManagementApi(): Promise<boolean> {
  console.log("\nApproach 2: Try Supabase Management API...")
  const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase/)?.[1]
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (!accessToken || !projectRef) {
    console.log("  No SUPABASE_ACCESS_TOKEN available. Skipping.")
    return false
  }
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    })
    const result = await res.json()
    if (res.ok) {
      console.log(`  Success! ${JSON.stringify(result)}`)
      return true
    }
    console.log(`  Failed (${res.status}): ${JSON.stringify(result)}`)
    return false
  } catch (e) {
    console.log(`  Failed: ${(e as Error).message}`)
    return false
  }
}

async function tryPgViaRest(): Promise<boolean> {
  console.log("\nApproach 3: Try direct SQL via PostgREST admin endpoint...")
  // Some Supabase projects expose a /sql endpoint via the REST API
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    if (res.ok) {
      const data = await res.json()
      console.log(`  Success! ${JSON.stringify(data)}`)
      return true
    }
    console.log(`  Failed (${res.status}): ${await res.text().catch(() => "unknown")}`)
    return false
  } catch (e) {
    console.log(`  Failed: ${(e as Error).message}`)
    return false
  }
}

async function main() {
  console.log("=== Attempting to apply migration 014 ===\n")

  // First check current state
  console.log("Checking current column state...")
  const { data: blogTest } = await supabase.from("blog_posts").select("id").limit(0)
  const { data: toolTest } = await supabase.from("workflow_settings").select("id").limit(0)
  console.log(`  blog_posts table: ${blogTest !== null ? "accessible" : "ERROR"}`)
  console.log(`  workflow_settings table: ${toolTest !== null ? "accessible" : "ERROR"}`)

  // Try each approach
  let applied = await tryExecSql()
  if (!applied) applied = await tryManagementApi()
  if (!applied) applied = await tryPgViaRest()

  if (applied) {
    console.log("\n✅ Migration applied! Verifying...")
    // Quick verification
    const { error: e1 } = await supabase.from("blog_posts").select("featured_image_url").limit(0)
    const { error: e2 } = await supabase.from("workflow_settings").select("status").limit(0)
    console.log(`  blog_posts.featured_image_url: ${e1 ? "❌ MISSING" : "✅ EXISTS"}`)
    console.log(`  workflow_settings.status: ${e2 ? "❌ MISSING" : "✅ EXISTS"}`)
  } else {
    console.log("\n❌ Could not apply migration automatically.")
    console.log("The SQL needs to be applied manually via Supabase Dashboard.")
    console.log(`\nDashboard URL: https://supabase.com/dashboard/project/vsapklipfevnwwsuhkai/sql/new`)
    console.log("\nPaste the SQL from: supabase/migrations/014_blog_and_tool_status_columns.sql")
  }
}

main()
