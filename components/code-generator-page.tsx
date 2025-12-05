"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Check, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { AuditReport, Vulnerability } from "@/lib/nullshot/types"
import { useToast } from "@/hooks/use-toast"

interface CodeGeneratorPageProps {
    code: string
    report: AuditReport
    onBack: () => void
    onApplyFix: (newCode: string) => void
}

export function CodeGeneratorPage({ code, report, onBack, onApplyFix }: CodeGeneratorPageProps) {
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)
    const [fixedCode, setFixedCode] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const { toast } = useToast()

    const handleGenerateFix = async (vuln: Vulnerability) => {
        setIsGenerating(true)
        setSelectedVuln(vuln)
        try {
            const response = await fetch("/api/fix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, vulnerability: vuln }),
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setFixedCode(data.fixedCode)
        } catch (error: any) {
            toast({
                title: "Fix Generation Failed",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Audit
                </Button>
                <h2 className="text-2xl font-bold text-white">Code Generator MCP</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Vulnerability List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Detected Issues</h3>
                    {report.vulnerabilities.map((v) => (
                        <Card
                            key={v.id}
                            className={`p-4 cursor-pointer transition-all ${selectedVuln?.id === v.id
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-white/10 bg-black/20 hover:border-white/20"
                                }`}
                            onClick={() => {
                                setSelectedVuln(v)
                                setFixedCode(null) // Reset fixed code when switching selection
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-1 rounded border ${v.severity === "High" ? "border-red-500 text-red-400" :
                                        v.severity === "Medium" ? "border-yellow-500 text-yellow-400" :
                                            "border-blue-500 text-blue-400"
                                    }`}>
                                    {v.severity}
                                </span>
                            </div>
                            <h4 className="text-white font-medium text-sm">{v.title}</h4>
                        </Card>
                    ))}
                </div>

                {/* Code Comparison */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedVuln ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">
                                    Fixing: {selectedVuln.title}
                                </h3>
                                {fixedCode && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setFixedCode(null)}
                                            className="border-red-500/50 text-red-400 hover:bg-red-950"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => onApplyFix(fixedCode)}
                                            className="bg-green-600 hover:bg-green-500 text-white"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Apply Fix
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {fixedCode ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-2">Original Code</p>
                                        <CodeEditor value={code} onChange={() => { }} readOnly />
                                    </div>
                                    <div>
                                        <p className="text-green-400 text-sm mb-2">Proposed Fix</p>
                                        <CodeEditor value={fixedCode} onChange={() => { }} readOnly />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] bg-black/20 rounded-lg border border-white/10">
                                    <p className="text-slate-400 mb-4 text-center max-w-md">
                                        {selectedVuln.description}
                                    </p>
                                    <Button
                                        onClick={() => handleGenerateFix(selectedVuln)}
                                        disabled={isGenerating}
                                        className="bg-purple-600 hover:bg-purple-500 text-white"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Generating Fix...
                                            </>
                                        ) : (
                                            "Generate Secure Fix"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            Select an issue to generate a fix
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
