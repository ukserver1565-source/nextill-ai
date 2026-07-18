/**
 * fix-rls-public-read.ts
 * Ensures public-read RLS policies exist on tables that need anonymous access.
 * Uses the Supabase Management API or outputs SQL for manual execution.
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

const SQL = `
-- Fix: Ensure public-read RLS policies exist
-- These should have been created by 002_rls_policies.sql and 011_final_production_architecture.sql

-- PLANS: public can read active plans
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plans_public_read' AND tablename = 'plans') THEN
    CREATE POLICY plans_public_read ON public.plans FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- TOOL SETTINGS: public can read enabled tools
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tool_settings_public_read' AND tablename = 'tool_settings') THEN
    CREATE POLICY tool_settings_public_read ON public.tool_settings FOR SELECT USING (is_enabled = true);
  END IF;
END $$;

-- AI MODELS: public can read enabled models
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_models_public_read' AND tablename = 'ai_models') THEN
    CREATE POLICY ai_models_public_read ON public.ai_models FOR SELECT USING (is_enabled = true);
  END IF;
END $$;

-- BLOG CATEGORIES: public can read all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_categories_public_read' AND tablename = 'blog_categories') THEN
    CREATE POLICY blog_categories_public_read ON public.blog_categories FOR SELECT USING (true);
  END IF;
END $$;

-- SITE SETTINGS: public can read all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'site_settings_public_read' AND tablename = 'site_settings') THEN
    CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT USING (true);
  END IF;
END $$;

-- WORKFLOW SETTINGS: public can read enabled workflows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_settings_public_read' AND tablename = 'workflow_settings') THEN
    CREATE POLICY workflow_settings_public_read ON public.workflow_settings FOR SELECT USING (is_enabled = true);
  END IF;
END $$;

-- PROMPT TEMPLATES: public can read active templates
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'prompt_templates_public_read' AND tablename = 'prompt_templates') THEN
    CREATE POLICY prompt_templates_public_read ON public.prompt_templates FOR SELECT USING (is_active = true);
  END IF;
END $$;
`

async function main() {
  const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase/)?.[1]
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN

  if (accessToken && projectRef) {
    console.log("Executing RLS fix via Management API...")
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    })
    const result = await res.json()
    if (res.ok) {
      console.log("✅ RLS policies applied successfully!")
    } else {
      console.log("❌ Error:", JSON.stringify(result))
    }
  } else {
    console.log("No SUPABASE_ACCESS_TOKEN — outputting SQL for manual execution.\n")
    console.log("Go to: https://supabase.com/dashboard/project/_/sql/new")
    console.log("Paste the following SQL and click 'Run':\n")
    console.log(SQL)
  }
}

main()
