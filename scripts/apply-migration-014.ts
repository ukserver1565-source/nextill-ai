/**
 * apply-migration-014.ts
 * Applies blog columns + tool status columns migration.
 * 1. First checks if columns already exist
 * 2. Tries via Supabase Management API (requires SUPABASE_ACCESS_TOKEN)
 * 3. Falls back to printing SQL for manual execution
 */
import * as fs from "fs"
import * as path from "path"
import { createClient } from "@supabase/supabase-js"

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
const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase/)?.[1]

async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    // Try selecting the column — if it fails, column doesn't exist
    const { error } = await supabase.from(table).select(column).limit(0)
    if (error && (error.message.includes("column") || error.message.includes("does not exist"))) {
      return false
    }
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log("=== Migration 014: Blog + Tool Status Columns ===\n")
  console.log(`Project: ${projectRef}`)
  console.log(`URL: ${env.NEXT_PUBLIC_SUPABASE_URL}\n`)

  // Step 1: Check current state
  console.log("--- Checking blog_posts columns ---")
  const blogColumns = ["featured_image_url", "author_id", "published_at", "view_count"]
  const missingBlog: string[] = []
  for (const col of blogColumns) {
    const exists = await checkColumnExists("blog_posts", col)
    console.log(`  ${exists ? "✅" : "❌"} blog_posts.${col}`)
    if (!exists) missingBlog.push(col)
  }

  console.log("\n--- Checking workflow_settings columns ---")
  const toolColumns = ["status", "api_verified", "last_tested_at", "last_test_result"]
  const missingTool: string[] = []
  for (const col of toolColumns) {
    const exists = await checkColumnExists("workflow_settings", col)
    console.log(`  ${exists ? "✅" : "❌"} workflow_settings.${col}`)
    if (!exists) missingTool.push(col)
  }

  const totalMissing = missingBlog.length + missingTool.length
  if (totalMissing === 0) {
    console.log("\n✅ All columns already exist! Migration already applied.")
    return
  }

  console.log(`\n${totalMissing} columns missing. Applying migration...\n`)

  // Step 2: Read migration SQL
  const sqlPath = path.resolve(__dirname, "..", "supabase", "migrations", "014_blog_and_tool_status_columns.sql")
  const sql = fs.readFileSync(sqlPath, "utf-8")

  // Step 3: Try Management API
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (accessToken && projectRef) {
    console.log("Attempting via Supabase Management API...")
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
        console.log("✅ Migration applied successfully via Management API!")
        console.log("Result:", JSON.stringify(result, null, 2))
        return
      } else {
        console.log("❌ Management API returned error:", JSON.stringify(result, null, 2))
      }
    } catch (err) {
      console.log("❌ Management API call failed:", (err as Error).message)
    }
  } else {
    console.log("No SUPABASE_ACCESS_TOKEN found.")
  }

  // Step 4: Fallback — print SQL for manual execution
  console.log("\n" + "=".repeat(60))
  console.log("MANUAL STEP REQUIRED")
  console.log("=".repeat(60))
  console.log("\nOpen Supabase Dashboard SQL Editor:")
  console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new\n`)
  console.log("Paste and run the following SQL:\n")
  console.log("--- SQL START ---")
  console.log(sql)
  console.log("--- SQL END ---")
  console.log("\nAfter running, re-run this script to verify.")
}

main()
