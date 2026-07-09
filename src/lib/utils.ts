import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const pulseScoreMetrics = {
  seoQuality: 82,
  readability: 78,
  aiDetectionRisk: 91,
  keywordUsage: 75,
  headingStructure: 85,
  internalLinking: 68,
  contentDepth: 80,
  metaOptimization: 72,
  schema: 60,
  imageSEO: 55,
  pageSpeed: 70,
}

export function calculatePulseScore(): number {
  const vals = Object.values(pulseScoreMetrics)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

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


