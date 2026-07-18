import { getAdminOrNull } from "@/lib/supabase/admin"

export interface PlanData {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: string[]
  is_active: boolean
  is_popular: boolean
  badge: string | null
  max_projects: number
  max_documents: number
  max_article_length: number
  max_reports_per_month: number
  report_history_days: number
  exports: string[]
  support_level: string
  sort_order: number
}

/**
 * Server-side plan fetch — callable from Server Components.
 * Returns active plans sorted by sort_order, or fallback plans if the
 * database is unreachable or empty.
 */
export async function getActivePlans(): Promise<PlanData[]> {
  const supabase = getAdminOrNull()
  if (!supabase) return FALLBACK_PLANS

  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("price_monthly", { ascending: true })

    if (error || !data || data.length === 0) return FALLBACK_PLANS
    return data as PlanData[]
  } catch {
    return FALLBACK_PLANS
  }
}

export const FALLBACK_PLANS: PlanData[] = [
  {
    id: "fallback-free", name: "Free", slug: "free",
    price_monthly: 0, price_yearly: 0, credits: 100, is_active: true,
    is_popular: false, badge: null, sort_order: 0, support_level: "community",
    exports: ["txt"], max_projects: 1, max_documents: 10, max_article_length: 1500,
    max_reports_per_month: 1, report_history_days: 7,
    features: ["1 Domain Intelligence check/day", "1 Post Generator test/day", "1 Plagiarism check/day", "1 project", "10 documents"],
  },
  {
    id: "fallback-starter", name: "Starter", slug: "starter",
    price_monthly: 19, price_yearly: 190, credits: 2000, is_active: true,
    is_popular: false, badge: null, sort_order: 1, support_level: "email",
    exports: ["txt", "markdown"], max_projects: 5, max_documents: 50, max_article_length: 2000,
    max_reports_per_month: 20, report_history_days: 30,
    features: ["Domain Intelligence — basic analysis", "Post Generator — up to 2,000 words", "SEO title, meta, FAQ, schema", "5 projects", "50 documents", "Email support"],
  },
  {
    id: "fallback-pro", name: "Pro", slug: "pro",
    price_monthly: 49, price_yearly: 490, credits: 7500, is_active: true,
    is_popular: true, badge: "MOST POPULAR", sort_order: 2, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 25, max_documents: 500, max_article_length: 5000,
    max_reports_per_month: 100, report_history_days: 365,
    features: ["Everything in Starter", "Domain Intelligence — full live metrics", "Competitor & backlink analysis", "Post Generator — up to 5,000 words", "25 projects", "500 documents", "Priority email support"],
  },
  {
    id: "fallback-business", name: "Business", slug: "business",
    price_monthly: 99, price_yearly: 990, credits: 20000, is_active: true,
    is_popular: false, badge: null, sort_order: 3, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 100, max_documents: 5000, max_article_length: 10000,
    max_reports_per_month: 500, report_history_days: 9999,
    features: ["Everything in Pro", "Post Generator — up to 10,000 words", "100 projects", "5,000 documents", "Unlimited report history", "Priority support"],
  },
]
