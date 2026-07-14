export interface WorkflowStep {
  id: string
  name: string
  slug: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  progress?: number
  startedAt?: string
  completedAt?: string
  error?: string
  result?: unknown
}

export interface WorkflowRun {
  id: string
  workflowSlug: string
  userId: string | null
  guestId: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  inputData: Record<string, unknown>
  outputData: Record<string, unknown>
  steps: WorkflowStep[]
  currentStep: number
  totalSteps: number
  creditsUsed: number
  error?: string
  startedAt: string
  completedAt?: string
}

export interface KeywordIntelligenceResult {
  keywords: KeywordRow[]
  longTailKeywords: string[]
  questions: string[]
  relatedKeywords: string[]
  lsiKeywords: string[]
  nlpTerms: string[]
  intent: string
  difficulty: number
  cpc: number
  trend: string
  cluster: string
  topicalMap: TopicalMapItem[]
  totalResults: number
  engine: string
}

export interface KeywordRow {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  trend: 'up' | 'down' | 'stable'
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  competition: 'low' | 'medium' | 'high'
  cluster: string
}

export interface TopicalMapItem {
  pillar: string
  subtopics: string[]
}

export interface PostGeneratorResult {
  seoTitle: string
  metaDescription: string
  slug: string
  h1: string
  sections: { h2: string; h3: string[]; content: string }[]
  intro: string
  body: string
  faqs: { question: string; answer: string }[]
  conclusion: string
  cta: string
  internalLinks: { text: string; url: string; relevance: number }[]
  schemaJson: Record<string, unknown>
  tags: string[]
  categorySuggestions: string[]
  wordCount: number
  readingTime: number
  seoScore: number
  humanScore: number
  aiScore: number
  plagiarismRisk: number
  readabilityGrade: string
  content: string
  htmlContent: string
  markdownContent: string
  pipelineSteps: WorkflowStep[]
  engine: string
}

export interface PlagiarismCheckerResult {
  originalityScore: number
  duplicateRisk: 'low' | 'medium' | 'high' | 'critical'
  matchedPhrases: { text: string; similarity: number; source?: string }[]
  sources: { url: string; title: string; matchPercent: number }[]
  recommendation: string
  safeToPublish: boolean
  wordCount: number
  engine: string
  aiDetection?: {
    score: number
    label: string
    sentences: { text: string; score: number }[]
  }
}
