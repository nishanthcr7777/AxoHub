export type Severity = "High" | "Medium" | "Low"

export interface Vulnerability {
  id: string
  title: string
  description: string
  severity: Severity
  lineStart?: number
  lineEnd?: number
  suggestion?: string
}

export interface AuditReport {
  id: string
  timestamp: number
  vulnerabilities: Vulnerability[]
  score: number // 0-100
  summary: string
  isApproved: boolean
}

export interface FixSuggestion {
  vulnerabilityId: string
  originalCode: string
  fixedCode: string
  explanation: string
}

export interface AgentResponse {
  success: boolean
  data?: any
  error?: string
}
