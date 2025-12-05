import { GeminiService } from "@/lib/gemini/service"
import { AuditReport, FixSuggestion, Vulnerability, AgentResponse } from "./types"

export class AuditorAgent {
    async audit(code: string): Promise<AgentResponse> {
        try {
            console.log("AuditorAgent: Starting audit...")
            const report = await GeminiService.analyzeCode(code)
            console.log("AuditorAgent: Audit complete.", report)
            return { success: true, data: report }
        } catch (error: any) {
            console.error("AuditorAgent: Audit failed.", error)
            return { success: false, error: error.message }
        }
    }
}

export class CodeGeneratorAgent {
    async fix(code: string, vulnerability: Vulnerability): Promise<AgentResponse> {
        try {
            console.log("CodeGeneratorAgent: Generating fix for", vulnerability.id)
            const suggestion = await GeminiService.generateFix(code, vulnerability)
            console.log("CodeGeneratorAgent: Fix generated.")
            return { success: true, data: suggestion }
        } catch (error: any) {
            console.error("CodeGeneratorAgent: Fix generation failed.", error)
            return { success: false, error: error.message }
        }
    }
}

export class MonitorAgent {
    // In a real system, this might listen to blockchain events or mempool.
    // Here, it simply acts as a trigger for the submission flow.
    async observeSubmission(code: string): Promise<boolean> {
        console.log("MonitorAgent: Observed new code submission.")
        return true
    }
}

export class AnalyzerAgent {
    // This agent could perform static analysis before calling OpenAI to save costs.
    // For now, it passes through to the Auditor.
    async preAnalyze(code: string): Promise<boolean> {
        // Simple check: is it empty?
        if (!code || code.trim().length === 0) {
            return false
        }
        return true
    }
}

export class ResponseAgent {
    evaluate(report: AuditReport): "APPROVE" | "REJECT" | "WARN" {
        if (report.vulnerabilities.some(v => v.severity === "High")) {
            return "REJECT"
        }
        if (report.vulnerabilities.some(v => v.severity === "Medium")) {
            return "WARN"
        }
        return "APPROVE"
    }
}

export class LearningAgent {
    // Placeholder for future learning capabilities
    async learnFromFeedback(reportId: string, userAction: "accepted" | "rejected") {
        console.log(`LearningAgent: Processed feedback for report ${reportId}: ${userAction}`)
    }
}
