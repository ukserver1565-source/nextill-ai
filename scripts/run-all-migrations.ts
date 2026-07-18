/**
 * run-all-migrations.ts
 * Runs all 14 migrations (001-013) against the Supabase database.
 *
 * Usage:
 *   npx tsx scripts/run-all-migrations.ts              # Combined SQL output + Management API (if token set)
 *   SUPABASE_ACCESS_TOKEN=xxx npx tsx scripts/run-all-migrations.ts  # Execute via Management API
 *   npx tsx scripts/run-all-migrations.ts --verify      # Verify database state after migrations
 */
import * as fs from "fs"
import * as path from "path"

// ── Load .env.local ──────────────────────────────────────────
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
const _SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase/)?.[1]

// ── Migration file order ─────────────────────────────────────
// Note: 005 has two files — enterprise tables first, then the constraint fix
const MIGRATION_FILES = [
  "001_core_tables.sql",
  "002_rls_policies.sql",
  "003_seed.sql",
  "004_functions.sql",
  "005_enterprise_tables.sql",
  "005_fix_role_constraint.sql",
  "006_apply_missing_enterprise.sql",
  "007_fix_role_constraint_idempotent.sql",
  "008_domain_intelligence.sql",
  "009_admin_permissions_and_prompt_fix.sql",
  "010_monetization_architecture.sql",
  "011_final_production_architecture.sql",
  "012_sync_credits_trigger.sql",
  "013_fix_rls_recursion.sql",
]

// ── Verification queries ─────────────────────────────────────
const VERIFY_QUERIES: Record<string, string> = {
  "Table count": `
    SELECT COUNT(*) as count FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `,
  "Plans": "SELECT COUNT(*) as count FROM public.plans",
  "Tool Settings": "SELECT COUNT(*) as count FROM public.tool_settings",
  "AI Models": "SELECT COUNT(*) as count FROM public.ai_models",
  "Blog Categories": "SELECT COUNT(*) as count FROM public.blog_categories",
  "Site Settings": "SELECT COUNT(*) as count FROM public.site_settings",
  "Workflow Settings": "SELECT COUNT(*) as count FROM public.workflow_settings",
  "AI Providers": "SELECT COUNT(*) as count FROM public.ai_providers",
  "Prompt Templates": "SELECT COUNT(*) as count FROM public.prompt_templates",
  "Provider Statuses": "SELECT COUNT(*) as count FROM public.provider_statuses",
  "RLS Policies": `
    SELECT COUNT(*) as count FROM pg_policies WHERE schemaname = 'public'
  `,
  "Functions": `
    SELECT COUNT(*) as count FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
  `,
  "Plans detail": `
    SELECT slug, name, price_monthly, credits, is_active
    FROM public.plans ORDER BY sort_order, slug
  `,
  "Tools detail": `
    SELECT tool_slug, tool_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit
    FROM public.tool_settings ORDER BY tool_slug
  `,
  "Models detail": `
    SELECT provider, model_name, is_enabled, is_default
    FROM public.ai_models ORDER BY provider, model_name
  `,
}

// ── Helpers ──────────────────────────────────────────────────
function _readEnv(path: string): Record<string, string> {
  const raw = fs.readFileSync(path, "utf-8")
  const env: Record<string, string> = {}
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
  }
  return env
}

async function executeSQL(sql: string, _label: string): Promise<{ success: boolean; error?: string }> {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (!accessToken) return { success: false, error: "No SUPABASE_ACCESS_TOKEN" }

  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      }
    )
    const result = await res.json()
    if (!res.ok) {
      return { success: false, error: JSON.stringify(result) }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const isVerify = process.argv.includes("--verify")
  const isDryRun = process.argv.includes("--dry-run")

  console.log("╔══════════════════════════════════════════════════════════════╗")
  console.log("║        Nextill AI — Full Migration Runner                   ║")
  console.log("╚══════════════════════════════════════════════════════════════╝")
  console.log(`\n  Project: ${projectRef}`)
  console.log(`  URL: ${SUPABASE_URL}`)
  console.log(`  Mode: ${isVerify ? "VERIFY" : isDryRun ? "DRY RUN" : process.env.SUPABASE_ACCESS_TOKEN ? "AUTO-EXECUTE" : "OUTPUT SQL"}`)

  const migrationsDir = path.resolve(__dirname, "..", "supabase", "migrations")
  const outputDir = path.resolve(__dirname, "..", "supabase")

  if (isVerify) {
    console.log("\n── VERIFICATION ──────────────────────────────────────────────\n")
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN
    if (!accessToken) {
      console.log("❌ No SUPABASE_ACCESS_TOKEN — cannot verify remotely.")
      console.log("   Set SUPABASE_ACCESS_TOKEN and re-run.")
      return
    }

    for (const [label, query] of Object.entries(VERIFY_QUERIES)) {
      try {
        const res = await fetch(
          `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        )
        const result = await res.json()
        if (res.ok && result.result) {
          console.log(`  ✅ ${label}:`, JSON.stringify(result.result).slice(0, 200))
        } else {
          console.log(`  ❌ ${label}:`, JSON.stringify(result).slice(0, 200))
        }
      } catch (err: any) {
        console.log(`  ❌ ${label}: ${err.message}`)
      }
    }
    return
  }

  // ── Build combined SQL ─────────────────────────────────────
  let combinedSQL = `-- ============================================================\n`
  combinedSQL += `-- Nextill AI — Combined Migration (all 14 files)\n`
  combinedSQL += `-- Generated: ${new Date().toISOString()}\n`
  combinedSQL += `-- ============================================================\n\n`

  let successCount = 0
  let _failCount = 0

  for (const file of MIGRATION_FILES) {
    const filePath = path.join(migrationsDir, file)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  MISSING: ${file} — skipping`)
      _failCount++
      continue
    }
    const sql = fs.readFileSync(filePath, "utf-8")
    combinedSQL += `\n-- ============================================================\n`
    combinedSQL += `-- ${file}\n`
    combinedSQL += `-- ============================================================\n\n`
    combinedSQL += sql
    combinedSQL += `\n`
    successCount++
    console.log(`  ✅ ${file} (${sql.length} chars)`)
  }

  console.log(`\n  Loaded: ${successCount}/${MIGRATION_FILES.length} files`)

  // ── Write combined SQL file ────────────────────────────────
  const combinedPath = path.join(outputDir, "combined-migration-all.sql")
  fs.writeFileSync(combinedPath, combinedSQL)
  console.log(`\n  📄 Combined SQL written to: ${combinedPath}`)
  console.log(`     Total: ${combinedSQL.length} chars`)

  // ── Execute or output ──────────────────────────────────────
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN

  if (accessToken) {
    console.log("\n── EXECUTING VIA MANAGEMENT API ─────────────────────────────\n")

    // Execute each migration separately so we can track which one fails
    let allPassed = true
    for (const file of MIGRATION_FILES) {
      const filePath = path.join(migrationsDir, file)
      if (!fs.existsSync(filePath)) continue
      const sql = fs.readFileSync(filePath, "utf-8")

      process.stdout.write(`  Running ${file}... `)
      const result = await executeSQL(sql, file)
      if (result.success) {
        console.log("✅")
      } else {
        console.log(`❌ ${result.error}`)
        allPassed = false
        // Don't stop — some errors are expected (e.g., constraint already exists)
      }
    }

    if (allPassed) {
      console.log("\n  🎉 All migrations executed successfully!")
    } else {
      console.log("\n  ⚠️  Some migrations had errors — check output above.")
      console.log("     Many errors are expected (constraint already exists, etc.)")
    }
  } else {
    console.log("\n── MANUAL EXECUTION ─────────────────────────────────────────\n")
    console.log("  No SUPABASE_ACCESS_TOKEN found.")
    console.log("  Options:")
    console.log("  1. Set SUPABASE_ACCESS_TOKEN and re-run")
    console.log(`  2. Copy SQL from: ${combinedPath}`)
    console.log("  3. Go to: https://supabase.com/dashboard/project/_/sql/new")
    console.log("  4. Paste and click 'Run'\n")
  }
}

main().catch(console.error)
