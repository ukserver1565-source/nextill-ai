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

const tables = [
  "profiles", "plans", "credits", "credit_logs", "payments", "subscriptions",
  "coupons", "tool_settings", "workflow_settings", "ai_providers", "ai_api_keys",
  "ai_models", "prompt_templates", "site_settings", "security_logs",
  "admin_audit_logs", "system_logs", "documents", "projects", "blog_posts",
  "blog_categories", "contact_messages", "usage_logs", "guest_usage",
  "ai_logs", "workflow_runs", "integration_settings", "backup_exports",
  "seo_settings", "email_settings", "keyword_research", "generated_posts",
  "plagiarism_reports", "api_keys",
]

const rpcs = [
  { name: "deduct_credits", params: { p_user_id: "00000000-0000-0000-0000-000000000000", p_amount: 0 } },
  { name: "add_credits", params: { p_user_id: "00000000-0000-0000-0000-000000000000", p_amount: 0 } },
  { name: "get_user_credits", params: { p_user_id: "00000000-0000-0000-0000-000000000000" } },
]

async function main() {
  console.log("=== Testing all database tables ===\n")
  let pass = 0, fail = 0

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1)
    if (error) {
      console.log(`  ❌ ${table} | FAIL | ${error.message}`)
      fail++
    } else {
      console.log(`  ✅ ${table} | OK | ${(data || []).length} rows`)
      pass++
    }
  }

  console.log("\n=== Testing RPCs ===\n")
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc.name, rpc.params)
    if (error) {
      console.log(`  ❌ ${rpc.name} | FAIL | ${error.message}`)
      fail++
    } else {
      console.log(`  ✅ ${rpc.name} | OK | result: ${data}`)
      pass++
    }
  }

  console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`)
  if (fail > 0) process.exit(1)
}

main()
