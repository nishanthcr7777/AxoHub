import {
    AuditorAgent,
    CodeGeneratorAgent,
    MonitorAgent,
    AnalyzerAgent,
    ResponseAgent,
    LearningAgent,
} from "./agents"
import { AuditReport, FixSuggestion, Vulnerability } from "./types"

export class NullshotOrchestrator {
    private auditor: AuditorAgent
    private codeGenerator: CodeGeneratorAgent
    private monitor: MonitorAgent
    private analyzer: AnalyzerAgent
    private response: ResponseAgent
    private learning: LearningAgent

    constructor() {
        this.auditor = new AuditorAgent()
        this.codeGenerator = new CodeGeneratorAgent()
        this.monitor = new MonitorAgent()
        this.analyzer = new AnalyzerAgent()
        this.response = new ResponseAgent()
        this.learning = new LearningAgent()
    }

    async startAudit(code: string): Promise<AuditReport> {
        // 1. Monitor observes submission
        await this.monitor.observeSubmission(code)

        // 2. Analyzer checks validity
        const isValid = await this.analyzer.preAnalyze(code)
        if (!isValid) {
            throw new Error("Invalid code submission")
        }

        // 3. Auditor performs audit
        const result = await this.auditor.audit(code)
        if (!result.success || !result.data) {
            throw new Error(result.error || "Audit failed")
        }

        return result.data
    }

    evaluateReport(report: AuditReport) {
        return this.response.evaluate(report)
    }

    async generateFix(code: string, vulnerability: Vulnerability): Promise<FixSuggestion> {
        const result = await this.codeGenerator.fix(code, vulnerability)
        if (!result.success || !result.data) {
            throw new Error(result.error || "Fix generation failed")
        }
        return result.data
    }

    async submitFeedback(reportId: string, action: "accepted" | "rejected") {
        await this.learning.learnFromFeedback(reportId, action)
    }
}

export const nullshot = new NullshotOrchestrator()
