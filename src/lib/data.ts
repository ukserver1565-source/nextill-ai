export const trendData = [
  { name: "Mon", value: 40 },
  { name: "Tue", value: 60 },
  { name: "Wed", value: 45 },
  { name: "Thu", value: 80 },
  { name: "Fri", value: 65 },
  { name: "Sat", value: 55 },
  { name: "Sun", value: 70 },
]

export const trafficData = [
  { name: "Jan", organic: 4000, direct: 2400, referral: 1800 },
  { name: "Feb", organic: 4200, direct: 2600, referral: 2000 },
  { name: "Mar", organic: 4800, direct: 2900, referral: 2200 },
  { name: "Apr", organic: 5100, direct: 3100, referral: 2500 },
  { name: "May", organic: 5500, direct: 3400, referral: 2700 },
  { name: "Jun", organic: 6200, direct: 3800, referral: 3100 },
  { name: "Jul", organic: 7000, direct: 4100, referral: 3400 },
  { name: "Aug", organic: 7600, direct: 4500, referral: 3600 },
  { name: "Sep", organic: 8300, direct: 4900, referral: 4000 },
  { name: "Oct", organic: 9100, direct: 5300, referral: 4300 },
  { name: "Nov", organic: 9800, direct: 5800, referral: 4700 },
  { name: "Dec", organic: 10500, direct: 6200, referral: 5100 },
]

export const keywordData = [
  { name: "Week 1", keywords: 45, clicks: 1200 },
  { name: "Week 2", keywords: 52, clicks: 1450 },
  { name: "Week 3", keywords: 61, clicks: 1800 },
  { name: "Week 4", keywords: 58, clicks: 2100 },
  { name: "Week 5", keywords: 72, clicks: 2500 },
  { name: "Week 6", keywords: 85, clicks: 2900 },
]

export const projectList = [
  {
    id: 1,
    name: "TechBlog Pro",
    domain: "techblogpro.com",
    articles: 145,
    keywords: 1280,
    seoScore: 86,
    traffic: "45.2K",
    lastUpdated: "2 min ago",
    logo: "TB",
  },
  {
    id: 2,
    name: "HealthWise Hub",
    domain: "healthwisehub.io",
    articles: 98,
    keywords: 940,
    seoScore: 72,
    traffic: "28.7K",
    lastUpdated: "15 min ago",
    logo: "HH",
  },
  {
    id: 3,
    name: "FinanceDaily",
    domain: "financedaily.com",
    articles: 210,
    keywords: 2100,
    seoScore: 91,
    traffic: "78.3K",
    lastUpdated: "1 hour ago",
    logo: "FD",
  },
  {
    id: 4,
    name: "TravelVista",
    domain: "travelvista.net",
    articles: 67,
    keywords: 560,
    seoScore: 65,
    traffic: "12.1K",
    lastUpdated: "3 hours ago",
    logo: "TV",
  },
]

export const sidebarMenu = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
    ],
  },
  {
    section: "AI Content",
    items: [
      { label: "AI Writer", icon: "PenSquare", path: "/ai-writer" },
      { label: "AI Humanizer", icon: "UserCheck", path: "/ai-humanizer" },
      { label: "AI Detector", icon: "SearchCheck", path: "/ai-detector" },
      { label: "Plagiarism Checker", icon: "FileSearch", path: "/plagiarism-checker" },
      { label: "Article Rewriter", icon: "RefreshCw", path: "/article-rewriter" },
      { label: "Grammar Checker", icon: "SpellCheck", path: "/grammar-checker" },
      { label: "Summarizer", icon: "AlignLeft", path: "/summarizer" },
      { label: "Translator", icon: "Languages", path: "/translator" },
    ],
  },
  {
    section: "SEO Suite",
    items: [
      { label: "Keyword Research", icon: "Search", path: "/keyword-research" },
      { label: "SEO Title Generator", icon: "Heading", path: "/seo-title-generator" },
      { label: "Meta Description", icon: "FileText", path: "/meta-description-generator" },
      { label: "Schema Generator", icon: "Code", path: "/schema-generator" },
      { label: "Sitemap Generator", icon: "Map", path: "/sitemap-generator" },
      { label: "Robots.txt Generator", icon: "Bot", path: "/robots-txt-generator" },
      { label: "Internal Link Generator", icon: "Link", path: "/internal-link-generator" },
      { label: "Content Brief", icon: "ClipboardList", path: "/content-brief" },
      { label: "Topical Map", icon: "GitBranch", path: "/topical-map" },
      { label: "FAQ Generator", icon: "HelpCircle", path: "/faq-generator" },
    ],
  },
  {
    section: "Advanced Tools",
    items: [
      { label: "Website Audit", icon: "Shield", path: "/website-audit" },
      { label: "Rank Tracker", icon: "TrendingUp", path: "/rank-tracker" },
      { label: "Backlink Checker", icon: "Share2", path: "/backlink-checker" },
    ],
  },
  {
    section: "Workspace",
    items: [
      { label: "Projects", icon: "FolderKanban", path: "/dashboard/projects" },
      { label: "Documents", icon: "File", path: "/dashboard/documents" },
      { label: "History", icon: "Clock", path: "/dashboard/history" },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Billing", icon: "CreditCard", path: "/dashboard/billing" },
      { label: "Settings", icon: "Settings", path: "/dashboard/settings" },
    ],
  },
]

export const quickActions = [
  { label: "Create Article", icon: "FilePlus", color: "from-blue-500 to-purple-600" },
  { label: "Humanize", icon: "UserCheck", color: "from-emerald-500 to-teal-600" },
  { label: "Rewrite", icon: "RefreshCw", color: "from-orange-500 to-red-600" },
  { label: "Translate", icon: "Languages", color: "from-violet-500 to-indigo-600" },
  { label: "Summarize", icon: "AlignLeft", color: "from-cyan-500 to-blue-600" },
  { label: "Grammar Fix", icon: "SpellCheck", color: "from-pink-500 to-rose-600" },
  { label: "Check AI", icon: "SearchCheck", color: "from-amber-500 to-orange-600" },
  { label: "Check Plagiarism", icon: "FileSearch", color: "from-red-500 to-pink-600" },
  { label: "Generate FAQ", icon: "HelpCircle", color: "from-lime-500 to-green-600" },
  { label: "Generate Outline", icon: "ListTree", color: "from-sky-500 to-indigo-600" },
  { label: "Generate Title", icon: "Heading", color: "from-purple-500 to-violet-600" },
  { label: "Generate Meta", icon: "FileText", color: "from-teal-500 to-emerald-600" },
  { label: "Generate Schema", icon: "Code", color: "from-indigo-500 to-blue-600" },
]
