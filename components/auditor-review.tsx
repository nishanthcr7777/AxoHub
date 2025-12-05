"use client"

import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, XCircle, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuditReport, Vulnerability } from "@/lib/nullshot/types"

interface AuditorReviewProps {
    report: AuditReport | null
    isLoading: boolean
    onProceed: () => void
    onFix: () => void
}

export function AuditorReview({ report, isLoading, onProceed, onFix }: AuditorReviewProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                />
                <p className="text-slate-400 animate-pulse">Auditor MCP is analyzing your code...</p>
            </div>
        )
    }

    if (!report) return null

    const hasHighSeverity = report.vulnerabilities.some((v) => v.severity === "High")
    const hasIssues = report.vulnerabilities.length > 0

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Auditor MCP Review</h2>
                    <p className="text-slate-400">
                        Security Score: <span className={report.score >= 80 ? "text-green-400" : "text-yellow-400"}>{report.score}/100</span>
                    </p>
                </div>
                {hasIssues ? (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/50 px-4 py-2 text-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Issues Detected
                    </Badge>
                ) : (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/50 px-4 py-2 text-lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approved
                    </Badge>
                )}
            </div>

            <Card className="p-6 bg-black/40 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Audit Summary</h3>
                <p className="text-slate-300 mb-6">{report.summary}</p>

                <div className="space-y-4">
                    {report.vulnerabilities.map((v) => (
                        <div
                            key={v.id}
                            className={`p-4 rounded-lg border ${v.severity === "High"
                                    ? "bg-red-900/20 border-red-500/30"
                                    : v.severity === "Medium"
                                        ? "bg-yellow-900/20 border-yellow-500/30"
                                        : "bg-blue-900/20 border-blue-500/30"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                            variant="outline"
                                            className={`${v.severity === "High"
                                                    ? "text-red-400 border-red-500/50"
                                                    : v.severity === "Medium"
                                                        ? "text-yellow-400 border-yellow-500/50"
                                                        : "text-blue-400 border-blue-500/50"
                                                }`}
                                        >
                                            {v.severity}
                                        </Badge>
                                        <h4 className="text-white font-medium">{v.title}</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-2">{v.description}</p>
                                    {v.suggestion && (
                                        <div className="mt-3 text-sm text-slate-300 bg-black/30 p-2 rounded border border-white/5">
                                            <span className="text-purple-400 font-mono">Suggestion:</span> {v.suggestion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex justify-end gap-4">
                {hasIssues && (
                    <Button
                        onClick={onFix}
                        className="bg-purple-600 hover:bg-purple-500 text-white"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Go to Code Generator MCP
                    </Button>
                )}

                <Button
                    onClick={onProceed}
                    disabled={hasHighSeverity}
                    variant={hasHighSeverity ? "outline" : "default"}
                    className={hasHighSeverity ? "opacity-50 cursor-not-allowed border-red-500/50 text-red-500" : "bg-green-600 hover:bg-green-500 text-white"}
                >
                    {hasHighSeverity ? "Fix Critical Issues to Proceed" : "Proceed to Submission"}
                    {!hasHighSeverity && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </motion.div>
    )
}
