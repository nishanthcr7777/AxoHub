"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Play, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { AuditorReview } from "@/components/auditor-review"
import { CodeGeneratorPage } from "@/components/code-generator-page"
import { AuditReport } from "@/lib/nullshot/types"
import { useToast } from "@/hooks/use-toast"

export function CodeGeneratorStandalone() {
    const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        balances[msg.sender] -= _amount;
    }
}`)
    const [isAuditing, setIsAuditing] = useState(false)
    const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
    const [step, setStep] = useState<"input" | "audit" | "fix">("input")
    const { toast } = useToast()

    const handleAudit = async () => {
        console.log("Starting audit for code:", code.slice(0, 50) + "...")
        if (!code.trim()) {
            toast({ title: "Code required", description: "Please enter some code to analyze.", variant: "destructive" })
            return
        }

        setIsAuditing(true)
        setAuditReport(null) // Reset previous report

        try {
            const response = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            })
            const report = await response.json()
            if (report.error) throw new Error(report.error)

            setAuditReport(report)
            setStep("audit")
        } catch (error: any) {
            toast({ title: "Audit Failed", description: error.message, variant: "destructive" })
        } finally {
            setIsAuditing(false)
        }
    }

    const reset = () => {
        setStep("input")
        setAuditReport(null)
    }

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {step === "input" && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Input Source Code</h2>
                            <Button
                                onClick={handleAudit}
                                disabled={isAuditing || !code.trim()}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                            >
                                {isAuditing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Run Security Audit
                                    </>
                                )}
                            </Button>
                        </div>

                        <Card className="p-6 bg-black/20 border-white/10">
                            <CodeEditor
                                value={code}
                                onChange={setCode}
                                language="solidity"
                                placeholder="// Paste your smart contract code here..."
                            />
                        </Card>
                    </motion.div>
                )}

                {step === "audit" && auditReport && (
                    <motion.div
                        key="audit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="ghost" onClick={reset} className="text-slate-400 hover:text-white">
                                ← New Audit
                            </Button>
                        </div>

                        <AuditorReview
                            report={auditReport}
                            isLoading={false}
                            onProceed={() => {
                                toast({ title: "Audit Approved", description: "Code is safe to use." })
                            }}
                            onFix={() => setStep("fix")}
                        />
                    </motion.div>
                )}

                {step === "fix" && auditReport && (
                    <motion.div
                        key="fix"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <CodeGeneratorPage
                            code={code}
                            report={auditReport}
                            onBack={() => setStep("audit")}
                            onApplyFix={(newCode) => {
                                setCode(newCode)
                                setStep("input") // Go back to input with new code to re-audit
                                toast({ title: "Fix Applied", description: "Code updated. Please re-run audit to verify." })
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
