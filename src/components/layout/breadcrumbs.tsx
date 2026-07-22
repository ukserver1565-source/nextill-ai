import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  tools: "Tools",
  settings: "Settings",
  billing: "Billing",
  projects: "Projects",
  documents: "Documents",
  history: "History",
  credits: "Credits",
  providers: "AI Providers",
  "api-keys": "API Keys",
  models: "Models",
  prompts: "Prompts",
  emails: "Emails",
  security: "Security",
  integrations: "Integrations",
  backups: "Backups",
  maintenance: "Maintenance",
  analytics: "Analytics",
  logs: "Logs",
  users: "Users",
  payments: "Payments",
  plans: "Plans",
  coupons: "Coupons",
  blog: "Blog",
  pricing: "Pricing",
  features: "Features",
  "how-it-works": "How It Works",
  about: "About",
  contact: "Contact",
  "domain-overview": "Domain Intelligence",
  "keyword-intelligence": "Keyword Intelligence",
  "post-generator": "Post Generator",
  "plagiarism-checker": "Plagiarism Checker",
  "ai-writer": "AI Writer",
  "ai-humanizer": "AI Humanizer",
  "ai-detector": "AI Detector",
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className={cn("flex items-center gap-1 text-xs text-muted", className)} aria-label="Breadcrumb">
      <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = routeLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
