export interface ProviderConfig {
  id: string
  name: string
  slug: string
  enabled: boolean
  priority: number
  baseUrl: string | null
  defaultModel: string | null
  status: "active" | "inactive" | "error"
  latencyMs: number
  usageCount: number
  totalCost: number
  config: Record<string, any>
}

export interface ApiKeyRecord {
  id: string
  providerSlug: string
  name: string
  keyPrefix: string
  keyEncrypted: string
  isEnabled: boolean
}

export interface ModelConfig {
  id: string
  providerId: string
  providerSlug?: string
  displayName: string
  modelName: string
  providerModelId: string
  isEnabled: boolean
  isDefault: boolean
  isFallback: boolean
  temperature: number
  topP: number
  maxTokens: number
  streaming: boolean
  priority: number
  costInput: number
  costOutput: number
}

export interface PromptTemplate {
  id: string
  slug: string
  name: string
  category: string
  promptText: string
  defaultModel: string | null
  temperature: number | null
  maxTokens: number | null
}

export interface AiLog {
  providerSlug: string
  modelName: string | null
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
  cost: number
  success: boolean
  error: string | null
  workflowSlug: string | null
}

export interface ProviderResult {
  success: boolean
  content: string
  error?: string
  model?: string
  provider?: string
  latencyMs?: number
}

export interface WorkflowSettings {
  id: string
  workflowSlug: string
  workflowName: string
  isEnabled: boolean
  creditsCost: number
  defaultModel: string | null
  fallbackModel: string | null
  promptTemplate: string | null
  temperature: number
  maxWords: number
  steps: string[]
  config: Record<string, any>
}

export interface LocalKeywordData {
  keywords: Array<{
    keyword: string
    volume: number
    difficulty: number
    cpc: number
    trend: string
    intent: string
  }>
  longTail: string[]
  questions: string[]
  related: string[]
  lsi: string[]
  nlpTerms: string[]
  topicalMap: Record<string, any>
  totalResults: number
}

export interface LocalOutline {
  h1: string
  sections: Array<{
    heading: string
    level: number
    points: string[]
  }>
  introPoints: string[]
  faqIdeas: string[]
  cta: string
  estimatedWordCount: number
}

export interface LocalArticle {
  title: string
  intro: string
  body: string
  sections: Array<{
    heading: string
    content: string
  }>
  conclusion: string
  cta: string
  wordCount: number
}

export interface LocalSeoTitles {
  titles: Array<{
    title: string
    score: number
    chars: number
  }>
}

export interface LocalMetaDescriptions {
  descriptions: Array<{
    description: string
    score: number
    chars: number
  }>
}

export interface LocalFaqs {
  faqs: Array<{
    question: string
    answer: string
  }>
  schema: Record<string, any>
}

export interface LocalSchema {
  schemas: Record<string, any>[]
}

export interface LocalInternalLinks {
  links: Array<{
    anchor: string
    target: string
    relevance: number
  }>
}

export interface LocalReadability {
  score: number
  grade: string
  fleschKincaid: number
  sentenceCount: number
  wordCount: number
  syllableCount: number
  averageSentenceLength: number
  averageSyllablesPerWord: number
  suggestions: string[]
}

export interface LocalGrammarResult {
  corrected: string
  errors: Array<{
    type: string
    message: string
    offset: number
    length: number
    suggestion: string
  }>
  errorCount: number
}

export interface LocalAiDetection {
  score: number
  verdict: string
  patterns: Array<{
    type: string
    frequency: number
    examples: string[]
  }>
}

export interface LocalPlagiarism {
  score: number
  matches: Array<{
    text: string
    similarity: number
    source: string
  }>
  originalityScore: number
  safeToPublish: boolean
}

export interface LocalHumanized {
  original: string
  humanized: string
  changes: Array<{
    original: string
    replacement: string
    reason: string
  }>
}

export interface LocalOptimization {
  seoScore: number
  keywordDensity: number
  headingStructure: string[]
  wordCount: number
  readingTime: number
  suggestions: Array<{
    type: "warning" | "error" | "info"
    message: string
  }>
}
