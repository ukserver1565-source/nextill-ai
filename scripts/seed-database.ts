/**
 * seed-database.ts
 * Seeds the database with initial data using the Supabase REST API.
 * This replaces the SQL-based 003_seed.sql execution.
 * Uses the service_role key to bypass RLS.
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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function upsert(table: string, rows: any[], conflictCol: string) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictCol, ignoreDuplicates: true })
  if (error) {
    console.log(`  ❌ ${table}: ${error.message}`)
    return false
  }
  console.log(`  ✅ ${table}: ${rows.length} rows upserted`)
  return true
}

async function count(table: string): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
  return count ?? 0
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗")
  console.log("║        Nextill AI — Database Seeder (REST API)              ║")
  console.log("╚══════════════════════════════════════════════════════════════╝\n")

  // ── PLANS ────────────────────────────────────────────────
  console.log("── PLANS ──")
  await upsert("plans", [
    { name: "Free", slug: "free", price_monthly: 0, price_yearly: 0, credits: 100, features: ["AI Writer (5/day)", "Basic tools", "1 project"], is_active: true, max_projects: 1, max_documents: 10, max_article_length: 1500, max_reports_per_month: 1, report_history_days: 7, sort_order: 0, is_popular: false, exports: ["txt"], support_level: "community", target_audience: "Try Nextill AI with limited free access" },
    { name: "Starter", slug: "starter", price_monthly: 19, price_yearly: 190, credits: 2000, features: ["Domain Intelligence — basic analysis", "Keyword ideas & local data", "20 saved reports/month", "Post Generator — up to 2,000 words", "AI generation, humanization, grammar", "SEO title, meta, FAQ, schema", "Plagiarism & Authenticity — local checks", "5 projects", "50 documents", "30-day report history", "TXT & Markdown exports", "Email support"], is_active: true, max_projects: 5, max_documents: 50, max_article_length: 2000, max_reports_per_month: 20, report_history_days: 30, sort_order: 1, is_popular: false, exports: ["txt", "markdown"], support_level: "email", target_audience: "New creators, bloggers, solo SEO users" },
    { name: "Pro", slug: "pro", price_monthly: 49, price_yearly: 490, credits: 7500, features: ["Everything in Starter", "Domain Intelligence — full live metrics", "Volume, KD, CPC, intent, trend", "Competitor & backlink analysis", "100 saved reports/month", "Post Generator — up to 5,000 words", "Priority provider routing", "Advanced humanization", "AI detection & live plagiarism", "25 projects", "500 documents", "1-year report history", "PDF, CSV, TXT, Markdown exports", "Priority email support"], is_active: true, max_projects: 25, max_documents: 500, max_article_length: 5000, max_reports_per_month: 100, report_history_days: 365, sort_order: 2, badge: "MOST POPULAR", is_popular: true, exports: ["pdf", "csv", "txt", "markdown"], support_level: "priority", target_audience: "Professional bloggers, SEO specialists, content marketers" },
    { name: "Business", slug: "business", price_monthly: 99, price_yearly: 990, credits: 20000, features: ["Everything in Pro", "500 saved reports/month", "Bulk keyword analysis", "Advanced competitor reports", "Advanced backlink reports", "Post Generator — up to 10,000 words", "100 projects", "5,000 documents", "Unlimited report history", "All export formats", "Priority support", "Business usage rights"], is_active: true, max_projects: 100, max_documents: 5000, max_article_length: 10000, max_reports_per_month: 500, report_history_days: 9999, sort_order: 3, is_popular: false, exports: ["pdf", "csv", "txt", "markdown"], support_level: "priority", target_audience: "Agencies, SEO teams, high-volume publishers" },
    // Keep agency/enterprise but deactivated
    { name: "Agency", slug: "agency", price_monthly: 149, price_yearly: 1490, credits: 15000, features: ["All Pro features", "Rank Tracker", "Backlink Checker", "50 projects", "Team (10 users)", "API access"], is_active: false, max_projects: 50, max_documents: 2500, sort_order: 4 },
    { name: "Enterprise", slug: "enterprise", price_monthly: 299, price_yearly: 2990, credits: 50000, features: ["All Agency features", "Unlimited projects", "Unlimited users", "Custom AI models", "Dedicated support", "SLA"], is_active: false, max_projects: 9999, max_documents: 99999, sort_order: 5 },
  ], "slug")

  // ── TOOL SETTINGS ────────────────────────────────────────
  console.log("\n── TOOL SETTINGS ──")
  await upsert("tool_settings", [
    { tool_slug: "ai-writer", tool_name: "AI Writer", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 5, premium_daily_limit: 100, credits_cost: 10, default_model: "gpt-4o", prompt_template: "Write a comprehensive article about {topic}" },
    { tool_slug: "ai-humanizer", tool_name: "AI Humanizer", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 3, premium_daily_limit: 50, credits_cost: 5, default_model: "gpt-4o", prompt_template: "Humanize this text: {text}" },
    { tool_slug: "ai-detector", tool_name: "AI Detector", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 5, premium_daily_limit: 100, credits_cost: 3, default_model: "custom-detector", prompt_template: "Analyze if this text is AI-generated: {text}" },
    { tool_slug: "plagiarism-checker", tool_name: "Plagiarism Checker", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 2, premium_daily_limit: 30, credits_cost: 8, default_model: "custom-plagiarism", prompt_template: "Check plagiarism for: {text}" },
    { tool_slug: "seo-title-generator", tool_name: "SEO Title Generator", is_enabled: true, guest_daily_limit: 2, free_daily_limit: 10, premium_daily_limit: 200, credits_cost: 2, default_model: "gpt-4o-mini", prompt_template: "Generate SEO titles for: {topic}" },
    { tool_slug: "meta-description-generator", tool_name: "Meta Description Generator", is_enabled: true, guest_daily_limit: 2, free_daily_limit: 10, premium_daily_limit: 200, credits_cost: 2, default_model: "gpt-4o-mini", prompt_template: "Generate meta description for: {topic}" },
    { tool_slug: "keyword-research", tool_name: "Keyword Research", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 5, premium_daily_limit: 50, credits_cost: 15, default_model: "gpt-4o", prompt_template: "Research keywords for: {niche}" },
    { tool_slug: "website-audit", tool_name: "Website Audit", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 1, premium_daily_limit: 10, credits_cost: 25, default_model: "custom-audit", prompt_template: "Audit website: {url}" },
    { tool_slug: "rank-tracker", tool_name: "Rank Tracker", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 1, premium_daily_limit: 20, credits_cost: 20, default_model: "custom-rank", prompt_template: "Track rankings for: {keyword}" },
    { tool_slug: "backlink-checker", tool_name: "Backlink Checker", is_enabled: true, guest_daily_limit: 1, free_daily_limit: 1, premium_daily_limit: 15, credits_cost: 18, default_model: "custom-backlink", prompt_template: "Analyze backlinks for: {url}" },
  ], "tool_slug")

  // ── AI MODELS ────────────────────────────────────────────
  console.log("\n── AI MODELS ──")
  await upsert("ai_models", [
    { provider: "Google", model_name: "Gemini Pro", api_key_secret_name: "GEMINI_API_KEY", is_enabled: true, is_default: true, cost_input: 0.000002, cost_output: 0.000003 },
    { provider: "OpenAI", model_name: "GPT-4o", api_key_secret_name: "OPENAI_API_KEY", is_enabled: true, is_default: false, cost_input: 0.000005, cost_output: 0.000015 },
    { provider: "OpenAI", model_name: "GPT-4o-mini", api_key_secret_name: "OPENAI_API_KEY", is_enabled: true, is_default: true, cost_input: 0.000001, cost_output: 0.000002 },
    { provider: "DeepSeek", model_name: "DeepSeek V3", api_key_secret_name: "DEEPSEEK_API_KEY", is_enabled: true, is_default: false, cost_input: 0.000001, cost_output: 0.000002 },
    { provider: "Anthropic", model_name: "Claude 3.5 Sonnet", api_key_secret_name: "ANTHROPIC_API_KEY", is_enabled: true, is_default: false, cost_input: 0.000003, cost_output: 0.000015 },
  ], "provider,model_name")

  // ── BLOG CATEGORIES ──────────────────────────────────────
  console.log("\n── BLOG CATEGORIES ──")
  await upsert("blog_categories", [
    { name: "AI Writing", slug: "ai-writing" },
    { name: "SEO", slug: "seo" },
    { name: "Content Marketing", slug: "content-marketing" },
    { name: "Tools", slug: "tools" },
  ], "slug")

  // ── SITE SETTINGS ────────────────────────────────────────
  console.log("\n── SITE SETTINGS ──")
  await upsert("site_settings", [
    { key: "site_name", value: { value: "Nextill AI" } },
    { key: "site_url", value: { value: "https://nextill.ai" } },
    { key: "free_daily_limit", value: { value: 5 } },
    { key: "maintenance_mode", value: { value: false } },
    { key: "contact_email", value: { value: "support@nextill.ai" } },
  ], "key")

  // ── WORKFLOW SETTINGS (ensure full seed) ─────────────────
  console.log("\n── WORKFLOW SETTINGS ──")
  await upsert("workflow_settings", [
    { workflow_slug: "keyword-intelligence", workflow_name: "Keyword Intelligence", is_enabled: true, credits_cost: 2, guest_daily_limit: 3, free_daily_limit: 10, premium_daily_limit: 100, default_model: "gemini-2.0-flash", steps: ["keyword_analysis", "long_tail", "questions", "related", "lsi", "nlp", "topical_map"] },
    { workflow_slug: "post-generator", workflow_name: "Post Generator", is_enabled: true, credits_cost: 10, guest_daily_limit: 1, free_daily_limit: 5, premium_daily_limit: 50, max_words: 5000, default_model: "gemini-2.0-flash", steps: ["keyword_analysis", "seo_outline", "ai_writer", "humanizer", "rewriter", "grammar_check", "ai_detector", "plagiarism_check", "seo_title", "meta_description", "faq", "schema", "internal_links", "readability", "final_optimization"] },
    { workflow_slug: "plagiarism-checker", workflow_name: "Plagiarism Checker", is_enabled: true, credits_cost: 4, guest_daily_limit: 2, free_daily_limit: 5, premium_daily_limit: 50, default_model: "gemini-2.0-flash", steps: ["text_analysis", "source_matching", "scoring"] },
    { workflow_slug: "domain-intelligence", workflow_name: "Domain Intelligence", is_enabled: true, credits_cost: 2, guest_daily_limit: 1, free_daily_limit: 5, premium_daily_limit: 100 },
  ], "workflow_slug")

  // ── AI PROVIDERS ─────────────────────────────────────────
  console.log("\n── AI PROVIDERS ──")
  await upsert("ai_providers", [
    { name: "Gemini", slug: "gemini", enabled: false, priority: 1, base_url: "https://generativelanguage.googleapis.com/v1beta", default_model: "gemini-2.0-flash", status: "inactive", config: { requires_api_key: true } },
    { name: "OpenAI", slug: "openai", enabled: false, priority: 2, base_url: "https://api.openai.com/v1", default_model: "gpt-4o", status: "inactive", config: { requires_api_key: true } },
    { name: "Claude", slug: "claude", enabled: false, priority: 3, base_url: "https://api.anthropic.com/v1", default_model: "claude-3-sonnet-20240229", status: "inactive", config: { requires_api_key: true } },
    { name: "DeepSeek", slug: "deepseek", enabled: false, priority: 4, base_url: "https://api.deepseek.com/v1", default_model: "deepseek-chat", status: "inactive", config: { requires_api_key: true } },
  ], "slug")

  // ── PROMPT TEMPLATES ─────────────────────────────────────
  console.log("\n── PROMPT TEMPLATES ──")
  await upsert("prompt_templates", [
    { slug: "keyword_intelligence", name: "Keyword Intelligence", category: "keyword", prompt_text: 'Analyze the seed keyword "{keyword}" for {country}/{language}.' },
    { slug: "post_generator_outline", name: "Post Generator Outline", category: "outline", prompt_text: 'Create a detailed SEO outline for "{keyword}".' },
    { slug: "seo_title_generator", name: "SEO Title Generator", category: "seo", prompt_text: 'Generate 10 SEO-optimized title tags for "{keyword}".' },
    { slug: "meta_description_generator", name: "Meta Description Generator", category: "seo", prompt_text: 'Generate 5 compelling meta descriptions for "{keyword}".' },
    { slug: "faq_generator", name: "FAQ Generator", category: "faq", prompt_text: 'Generate 8 frequently asked questions about "{keyword}".' },
  ], "slug")

  // ── VERIFY ───────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════")
  console.log("  VERIFICATION — Row Counts")
  console.log("══════════════════════════════════════════════════════════════")
  const tables = [
    "plans", "tool_settings", "ai_models", "blog_categories", "site_settings",
    "workflow_settings", "ai_providers", "prompt_templates"
  ]
  for (const t of tables) {
    const c = await count(t)
    console.log(`  ${t}: ${c} rows`)
  }

  // ── PLANS DETAIL ─────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════")
  console.log("  PLANS DETAIL")
  console.log("══════════════════════════════════════════════════════════════")
  const { data: plans } = await supabase
    .from("plans")
    .select("slug, name, price_monthly, credits, is_active, sort_order")
    .order("sort_order")
  if (plans) {
    for (const p of plans) {
      console.log(`  ${p.slug.padEnd(15)} ${p.name.padEnd(12)} $${String(p.price_monthly).padEnd(6)} ${String(p.credits).padEnd(8)} active=${p.is_active}`)
    }
  }
}

main().catch(console.error)
