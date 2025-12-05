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
    const [prompt, setPrompt] = useState("")
    const [generatedCode, setGeneratedCode] = useState("")
    const [explanation, setExplanation] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const { toast } = useToast()

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt required", description: "Please describe what you want to build.", variant: "destructive" })
            return
        }

        setIsGenerating(true)
        setGeneratedCode("")
        setExplanation("")

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            })
            const result = await response.json()
            if (result.error) throw new Error(result.error)

            setGeneratedCode(result.code)
            setExplanation(result.explanation)
            toast({ title: "Code Generated", description: "Your smart contract is ready." })
        } catch (error: any) {
            toast({ title: "Generation Failed", description: error.message, variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <Card className="p-6 bg-black/20 border-white/10 h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            Describe your Contract
                        </h2>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Create an ERC20 token named 'AxoToken' with a supply of 1 million, mintable by the owner, and burnable by anyone."
                            className="flex-1 bg-slate-900/50 border border-slate-600 rounded-md p-4 text-white placeholder:text-slate-500 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        />
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white w-full sm:w-auto"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Generate Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Output Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <Card className="p-6 bg-black/20 border-white/10 h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyan-400" />
                            Generated Code
                        </h2>
                        <div className="flex-1 min-h-[500px]">
                            <CodeEditor
                                value={generatedCode}
                                onChange={setGeneratedCode}
                                language="solidity"
                                placeholder="// Generated code will appear here..."
                                readOnly={false} // Allow user to edit after generation
                            />
                        </div>
                        {explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                            >
                                <h3 className="text-sm font-semibold text-purple-300 mb-1">AI Explanation</h3>
                                <p className="text-sm text-slate-300">{explanation}</p>
                            </motion.div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
