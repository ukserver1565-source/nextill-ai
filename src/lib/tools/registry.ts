export interface ToolDefinition {
  slug: string
  name: string
  description: string
  category: "content" | "seo" | "research" | "technical" | "writing"
  creditsCost: number
  guestLimit: number
  inputType: "text" | "textarea" | "url" | "keywords" | "code"
  icon: string
  color: string
  fields: ToolField[]
  settings?: ToolSetting[]
  route: string
  apiRoute: string
}

export interface ToolField {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "number" | "range"
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  default?: string | number
}

export interface ToolSetting {
  key: string
  label: string
  type: "select" | "number" | "toggle"
  default: string | number | boolean
  options?: { value: string; label: string }[]
}

export const toolsRegistry: ToolDefinition[] = [
  {
    slug: "ai-writer",
    name: "AI Writer",
    description: "Generate high-quality, SEO-optimized articles from a topic",
    category: "content",
    creditsCost: 5,
    guestLimit: 3,
    inputType: "text",
    icon: "PenSquare",
    color: "from-blue-500 to-purple-600",
    route: "/ai-writer",
    apiRoute: "/api/tools/ai-writer",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. The Benefits of Meditation", required: true },
      { key: "tone", label: "Tone", type: "select", options: [
        { value: "professional", label: "Professional" }, { value: "casual", label: "Casual" },
        { value: "persuasive", label: "Persuasive" }, { value: "informative", label: "Informative" },
        { value: "creative", label: "Creative" }, { value: "academic", label: "Academic" },
        { value: "storytelling", label: "Storytelling" },
      ], default: "professional" },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. Beginners, professionals" },
      { key: "keywords", label: "Keywords", type: "text", placeholder: "e.g. mindfulness, stress relief" },
      { key: "wordCount", label: "Word Count", type: "range", min: 100, max: 3000, default: 500 },
    ],
    settings: [
      { key: "includeHeadings", label: "Include Headings", type: "toggle", default: true },
      { key: "includeIntro", label: "Include Introduction", type: "toggle", default: true },
    ],
  },
  {
    slug: "ai-humanizer",
    name: "AI Humanizer",
    description: "Make AI-generated text sound natural and human-like",
    category: "writing",
    creditsCost: 3,
    guestLimit: 5,
    inputType: "textarea",
    icon: "UserCheck",
    color: "from-emerald-500 to-teal-600",
    route: "/ai-humanizer",
    apiRoute: "/api/tools/ai-humanizer",
    fields: [
      { key: "text", label: "Text to Humanize", type: "textarea", placeholder: "Paste AI-generated text here...", required: true },
      { key: "intensity", label: "Humanization Level", type: "select", default: "moderate", options: [
        { value: "light", label: "Light" }, { value: "moderate", label: "Moderate" }, { value: "aggressive", label: "Aggressive" },
      ]},
    ],
    settings: [
      { key: "preserveKeywords", label: "Preserve Keywords", type: "toggle", default: true },
      { key: "addVariations", label: "Add Phrase Variations", type: "toggle", default: false },
    ],
  },
  {
    slug: "ai-detector",
    name: "AI Detector",
    description: "Detect AI-generated content with sentence-level analysis",
    category: "research",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "textarea",
    icon: "SearchCheck",
    color: "from-amber-500 to-orange-600",
    route: "/ai-detector",
    apiRoute: "/api/tools/ai-detector",
    fields: [
      { key: "text", label: "Text to Analyze", type: "textarea", placeholder: "Paste text to check for AI generation...", required: true },
    ],
    settings: [
      { key: "sensitivity", label: "Detection Sensitivity", type: "select", default: "standard", options: [
        { value: "low", label: "Low" }, { value: "standard", label: "Standard" }, { value: "high", label: "High" },
      ]},
    ],
  },
  {
    slug: "plagiarism-checker",
    name: "Plagiarism Checker",
    description: "Check content originality against web sources",
    category: "research",
    creditsCost: 4,
    guestLimit: 2,
    inputType: "textarea",
    icon: "FileSearch",
    color: "from-red-500 to-pink-600",
    route: "/plagiarism-checker",
    apiRoute: "/api/tools/plagiarism-checker",
    fields: [
      { key: "text", label: "Content to Check", type: "textarea", placeholder: "Paste content to check for plagiarism...", required: true },
    ],
    settings: [
      { key: "deepScan", label: "Deep Web Scan", type: "toggle", default: true },
    ],
  },
  {
    slug: "seo-title-generator",
    name: "SEO Title Generator",
    description: "Generate click-worthy, SEO-optimized title tags",
    category: "seo",
    creditsCost: 1,
    guestLimit: 10,
    inputType: "text",
    icon: "Heading",
    color: "from-purple-500 to-violet-600",
    route: "/seo-title-generator",
    apiRoute: "/api/tools/seo-title-generator",
    fields: [
      { key: "topic", label: "Topic or Keyword", type: "text", placeholder: "e.g. best running shoes 2026", required: true },
      { key: "tone", label: "Tone", type: "select", default: "professional", options: [
        { value: "professional", label: "Professional" }, { value: "clickbaity", label: "Click-worthy" },
        { value: "howto", label: "How-to" }, { value: "listicle", label: "Listicle" },
      ]},
    ],
    settings: [
      { key: "count", label: "Number of Titles", type: "number", default: 10 },
    ],
  },
  {
    slug: "meta-description-generator",
    name: "Meta Description Generator",
    description: "Generate compelling meta descriptions for better CTR",
    category: "seo",
    creditsCost: 1,
    guestLimit: 10,
    inputType: "text",
    icon: "FileText",
    color: "from-teal-500 to-emerald-600",
    route: "/meta-description-generator",
    apiRoute: "/api/tools/meta-description-generator",
    fields: [
      { key: "topic", label: "Page Topic", type: "text", placeholder: "e.g. Complete guide to keto diet", required: true },
      { key: "keywords", label: "Target Keyword", type: "text", placeholder: "Primary keyword to include" },
    ],
    settings: [
      { key: "count", label: "Number of Descriptions", type: "number", default: 5 },
      { key: "maxLength", label: "Max Length (chars)", type: "number", default: 160 },
    ],
  },
  {
    slug: "keyword-research",
    name: "Keyword Research",
    description: "Find high-value keywords with search volume data",
    category: "research",
    creditsCost: 3,
    guestLimit: 3,
    inputType: "keywords",
    icon: "Search",
    color: "from-sky-500 to-indigo-600",
    route: "/keyword-research",
    apiRoute: "/api/tools/keyword-research",
    fields: [
      { key: "seed", label: "Seed Keywords", type: "text", placeholder: "e.g. SEO tools, content marketing", required: true },
      { key: "country", label: "Market", type: "select", default: "us", options: [
        { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" },
        { value: "ca", label: "Canada" }, { value: "au", label: "Australia" },
      ]},
    ],
    settings: [
      { key: "maxKeywords", label: "Max Keywords", type: "number", default: 20 },
    ],
  },
  {
    slug: "website-audit",
    name: "Website Audit",
    description: "Analyze your website for SEO and performance issues",
    category: "technical",
    creditsCost: 5,
    guestLimit: 2,
    inputType: "url",
    icon: "Shield",
    color: "from-lime-500 to-green-600",
    route: "/website-audit",
    apiRoute: "/api/tools/website-audit",
    fields: [
      { key: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true },
    ],
    settings: [
      { key: "depth", label: "Crawl Depth", type: "select", default: "standard", options: [
        { value: "basic", label: "Basic (Homepage only)" }, { value: "standard", label: "Standard (Up to 10 pages)" },
        { value: "deep", label: "Deep (Up to 50 pages)" },
      ]},
    ],
  },
  {
    slug: "rank-tracker",
    name: "Rank Tracker",
    description: "Track your keyword rankings across search engines",
    category: "seo",
    creditsCost: 5,
    guestLimit: 2,
    inputType: "keywords",
    icon: "TrendingUp",
    color: "from-cyan-500 to-blue-600",
    route: "/rank-tracker",
    apiRoute: "/api/tools/rank-tracker",
    fields: [
      { key: "domain", label: "Your Domain", type: "text", placeholder: "example.com", required: true },
      { key: "keywords", label: "Keywords to Track", type: "text", placeholder: "e.g. SEO services, digital marketing", required: true },
      { key: "country", label: "Country", type: "select", default: "us", options: [
        { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" },
        { value: "ca", label: "Canada" }, { value: "au", label: "Australia" },
      ]},
    ],
    settings: [
      { key: "device", label: "Device", type: "select", default: "desktop", options: [
        { value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobile" },
      ]},
    ],
  },
  {
    slug: "backlink-checker",
    name: "Backlink Checker",
    description: "Analyze backlink profile of any domain",
    category: "seo",
    creditsCost: 4,
    guestLimit: 2,
    inputType: "url",
    icon: "Share2",
    color: "from-violet-500 to-purple-600",
    route: "/backlink-checker",
    apiRoute: "/api/tools/backlink-checker",
    fields: [
      { key: "domain", label: "Domain to Analyze", type: "text", placeholder: "example.com", required: true },
    ],
    settings: [
      { key: "limit", label: "Results Limit", type: "number", default: 50 },
    ],
  },
  {
    slug: "schema-generator",
    name: "Schema Generator",
    description: "Generate JSON-LD structured data for better rich snippets",
    category: "technical",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "code",
    icon: "Code",
    color: "from-indigo-500 to-blue-600",
    route: "/schema-generator",
    apiRoute: "/api/tools/schema-generator",
    fields: [
      { key: "type", label: "Schema Type", type: "select", default: "article", options: [
        { value: "article", label: "Article" }, { value: "product", label: "Product" },
        { value: "faq", label: "FAQ" }, { value: "localBusiness", label: "Local Business" },
        { value: "recipe", label: "Recipe" }, { value: "review", label: "Review" },
        { value: "event", label: "Event" }, { value: "breadcrumb", label: "Breadcrumb" },
      ]},
      { key: "name", label: "Name / Title", type: "text", placeholder: "Title of the content", required: true },
      { key: "description", label: "Description", type: "text", placeholder: "Short description" },
    ],
    settings: [
      { key: "format", label: "Output Format", type: "select", default: "json", options: [
        { value: "json", label: "JSON-LD" }, { value: "microdata", label: "Microdata" },
      ]},
    ],
  },
  {
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    description: "Generate XML sitemaps for better search engine indexing",
    category: "technical",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "url",
    icon: "Map",
    color: "from-orange-500 to-red-600",
    route: "/sitemap-generator",
    apiRoute: "/api/tools/sitemap-generator",
    fields: [
      { key: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true },
    ],
    settings: [
      { key: "includeImages", label: "Include Images", type: "toggle", default: true },
      { key: "changefreq", label: "Change Frequency", type: "select", default: "weekly", options: [
        { value: "always", label: "Always" }, { value: "hourly", label: "Hourly" },
        { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" },
        { value: "never", label: "Never" },
      ]},
    ],
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Create and optimize your robots.txt file",
    category: "technical",
    creditsCost: 1,
    guestLimit: 10,
    inputType: "url",
    icon: "Bot",
    color: "from-pink-500 to-rose-600",
    route: "/robots-txt-generator",
    apiRoute: "/api/tools/robots-txt-generator",
    fields: [
      { key: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true },
      { key: "allowAll", label: "Crawl All", type: "select", default: "yes", options: [
        { value: "yes", label: "Allow All" }, { value: "custom", label: "Custom Rules" },
      ]},
    ],
    settings: [
      { key: "crawlDelay", label: "Crawl Delay (seconds)", type: "number", default: 10 },
    ],
  },
  {
    slug: "internal-link-generator",
    name: "Internal Link Builder",
    description: "Find and suggest internal linking opportunities",
    category: "seo",
    creditsCost: 3,
    guestLimit: 3,
    inputType: "url",
    icon: "Link",
    color: "from-green-500 to-emerald-600",
    route: "/internal-link-generator",
    apiRoute: "/api/tools/internal-link-generator",
    fields: [
      { key: "url", label: "Your Website URL", type: "text", placeholder: "https://example.com", required: true },
      { key: "targetKeyword", label: "Target Keyword", type: "text", placeholder: "Keyword to link from" },
    ],
    settings: [
      { key: "maxSuggestions", label: "Max Suggestions", type: "number", default: 20 },
    ],
  },
  {
    slug: "content-brief",
    name: "Content Brief Generator",
    description: "Create comprehensive content briefs for writers",
    category: "content",
    creditsCost: 3,
    guestLimit: 3,
    inputType: "text",
    icon: "ClipboardList",
    color: "from-yellow-500 to-orange-600",
    route: "/content-brief",
    apiRoute: "/api/tools/content-brief",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. Complete guide to email marketing", required: true },
      { key: "targetAudience", label: "Target Audience", type: "text", placeholder: "e.g. Marketing managers" },
      { key: "goal", label: "Content Goal", type: "select", default: "inform", options: [
        { value: "inform", label: "Inform & Educate" }, { value: "convert", label: "Convert & Sell" },
        { value: "engage", label: "Engage & Entertain" },
      ]},
    ],
    settings: [
      { key: "includeOutlines", label: "Include Outline", type: "toggle", default: true },
    ],
  },
  {
    slug: "topical-map",
    name: "Topical Map Generator",
    description: "Build topic clusters for better topical authority",
    category: "seo",
    creditsCost: 5,
    guestLimit: 2,
    inputType: "text",
    icon: "GitBranch",
    color: "from-cyan-500 to-teal-600",
    route: "/topical-map",
    apiRoute: "/api/tools/topical-map",
    fields: [
      { key: "topic", label: "Main Topic", type: "text", placeholder: "e.g. Digital Marketing", required: true },
    ],
    settings: [
      { key: "depth", label: "Cluster Depth", type: "select", default: "medium", options: [
        { value: "shallow", label: "Shallow (5-10 subtopics)" },
        { value: "medium", label: "Medium (10-20 subtopics)" },
        { value: "deep", label: "Deep (20-40 subtopics)" },
      ]},
    ],
  },
  {
    slug: "faq-generator",
    name: "FAQ Generator",
    description: "Generate FAQ sections with schema markup for better SEO",
    category: "content",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "text",
    icon: "HelpCircle",
    color: "from-lime-500 to-green-600",
    route: "/faq-generator",
    apiRoute: "/api/tools/faq-generator",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. WordPress SEO", required: true },
      { key: "count", label: "Number of FAQs", type: "number", default: 5 },
    ],
    settings: [
      { key: "includeSchema", label: "Include FAQ Schema", type: "toggle", default: true },
    ],
  },
  {
    slug: "article-rewriter",
    name: "Article Rewriter",
    description: "Rewrite existing content while preserving the original meaning",
    category: "writing",
    creditsCost: 3,
    guestLimit: 5,
    inputType: "textarea",
    icon: "RefreshCw",
    color: "from-orange-500 to-red-600",
    route: "/article-rewriter",
    apiRoute: "/api/tools/article-rewriter",
    fields: [
      { key: "text", label: "Article to Rewrite", type: "textarea", placeholder: "Paste article content here...", required: true },
      { key: "style", label: "Rewrite Style", type: "select", default: "professional", options: [
        { value: "professional", label: "Professional" }, { value: "simplified", label: "Simplified" },
        { value: "creative", label: "Creative" }, { value: "formal", label: "Formal" },
      ]},
    ],
    settings: [
      { key: "preserveStructure", label: "Preserve Structure", type: "toggle", default: true },
    ],
  },
  {
    slug: "grammar-checker",
    name: "Grammar Checker",
    description: "Fix grammar, punctuation, and style issues",
    category: "writing",
    creditsCost: 1,
    guestLimit: 10,
    inputType: "textarea",
    icon: "SpellCheck",
    color: "from-pink-500 to-rose-600",
    route: "/grammar-checker",
    apiRoute: "/api/tools/grammar-checker",
    fields: [
      { key: "text", label: "Text to Check", type: "textarea", placeholder: "Paste text to check for grammar issues...", required: true },
    ],
    settings: [
      { key: "checkStyle", label: "Style Check", type: "toggle", default: true },
      { key: "toneAnalysis", label: "Tone Analysis", type: "toggle", default: false },
    ],
  },
  {
    slug: "summarizer",
    name: "Text Summarizer",
    description: "Condense long content into concise, readable summaries",
    category: "writing",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "textarea",
    icon: "AlignLeft",
    color: "from-cyan-500 to-blue-600",
    route: "/summarizer",
    apiRoute: "/api/tools/summarizer",
    fields: [
      { key: "text", label: "Text to Summarize", type: "textarea", placeholder: "Paste long content here...", required: true },
      { key: "length", label: "Summary Length", type: "select", default: "medium", options: [
        { value: "short", label: "Short (2-3 sentences)" },
        { value: "medium", label: "Medium (1 paragraph)" },
        { value: "long", label: "Long (2-3 paragraphs)" },
      ]},
    ],
    settings: [
      { key: "bulletPoints", label: "Bullet Points", type: "toggle", default: false },
    ],
  },
  {
    slug: "translator",
    name: "Translator",
    description: "Translate content across 50+ languages",
    category: "writing",
    creditsCost: 2,
    guestLimit: 5,
    inputType: "textarea",
    icon: "Languages",
    color: "from-violet-500 to-indigo-600",
    route: "/translator",
    apiRoute: "/api/tools/translator",
    fields: [
      { key: "text", label: "Text to Translate", type: "textarea", placeholder: "Paste text to translate...", required: true },
      { key: "sourceLang", label: "Source Language", type: "select", default: "auto", options: [
        { value: "auto", label: "Auto-detect" }, { value: "en", label: "English" },
        { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
        { value: "de", label: "German" }, { value: "it", label: "Italian" },
        { value: "pt", label: "Portuguese" }, { value: "ru", label: "Russian" },
        { value: "zh", label: "Chinese" }, { value: "ja", label: "Japanese" },
        { value: "ko", label: "Korean" }, { value: "ar", label: "Arabic" },
      ]},
      { key: "targetLang", label: "Target Language", type: "select", default: "es", options: [
        { value: "en", label: "English" }, { value: "es", label: "Spanish" },
        { value: "fr", label: "French" }, { value: "de", label: "German" },
        { value: "it", label: "Italian" }, { value: "pt", label: "Portuguese" },
        { value: "ru", label: "Russian" }, { value: "zh", label: "Chinese" },
        { value: "ja", label: "Japanese" }, { value: "ko", label: "Korean" },
        { value: "ar", label: "Arabic" }, { value: "hi", label: "Hindi" },
      ]},
    ],
    settings: [
      { key: "preserveFormatting", label: "Preserve Formatting", type: "toggle", default: true },
    ],
  },
]

export function getTool(slug: string): ToolDefinition | undefined {
  return toolsRegistry.find(t => t.slug === slug)
}

export function getToolsByCategory(category: ToolDefinition["category"]): ToolDefinition[] {
  return toolsRegistry.filter(t => t.category === category)
}
