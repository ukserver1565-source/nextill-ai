/**
 * create-admin.ts — Development only.
 * ⚠️ Change password after first login. Do not use in production.
 *
 * Creates or updates a default admin account via Supabase Admin API.
 * Never exposes SERVICE_ROLE_KEY in client code.
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// Load env vars manually to avoid depending on dotenv
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
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const ADMIN_EMAILS = ["admin@nextill.ai", "admin@adultpulse.co.uk"]
const ADMIN_PASSWORD = "Admin@123456"

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log("🔧 Creating/updating admin account...\n")

  // 1. Check if user already exists via admin.users.list()
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error("❌ Failed to list users:", listErr.message)
    process.exit(1)
  }

  // Create/update admin users for all configured emails
  for (const ADMIN_EMAIL of ADMIN_EMAILS) {
    console.log(`\n🔧 Processing ${ADMIN_EMAIL}...`)

    let userId = users.users.find((u) => u.email === ADMIN_EMAIL)?.id

    if (userId) {
      console.log("👤 User already exists:", userId)

      // Update password
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
      if (updateErr) {
        console.error("❌ Failed to update user:", updateErr.message)
        process.exit(1)
      }
      console.log("🔑 Password updated and email confirmed.")
    } else {
      // Create user
      const { data, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Admin User" },
      })
      if (createErr) {
        console.error("❌ Failed to create user:", createErr.message)
        process.exit(1)
      }
      userId = data.user.id
      console.log("✅ User created:", userId)
    }

    // 2. Upsert profile with admin role
    const { error: profileErr } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        email: ADMIN_EMAIL,
        full_name: "Admin User",
        role: "admin",
        plan: "enterprise",
        status: "active",
      },
      { onConflict: "user_id" }
    )
    if (profileErr) {
      console.error("❌ Failed to upsert profile:", profileErr.message)
      process.exit(1)
    }
    console.log("📋 Profile set to admin role.")

    // 3. Upsert credits
    const { error: creditsErr } = await supabase.from("credits").upsert(
      {
        user_id: userId,
        balance: 10000,
      },
      { onConflict: "user_id" }
    )
    if (creditsErr) {
      console.error("❌ Failed to upsert credits:", creditsErr.message)
      process.exit(1)
    }
    console.log("💰 Credits set to 10,000.")
  }

  console.log("\n✅ All admin accounts ready!")
  console.log(`   Emails:   ${ADMIN_EMAILS.join(", ")}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
  console.log("\n⚠️  These are development accounts. Change passwords after first login.")
}

main()
