"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CodeEditor } from "@/components/code-editor"
import { ProgressBar } from "@/components/progress-bar"
import { SuccessModal } from "@/components/success-modal"
import { useWallet } from "@/hooks/use-wallet"
import { wagmiConfig } from "@/lib/web3modal"
import { sourceRegistryAbi } from "@/lib/abis/source-registry"
import { SOURCE_REGISTRY_ADDRESSES } from "@/lib/contracts/source-registry"
import { useToast } from "@/hooks/use-toast"
import { writeContract, waitForTransactionReceipt } from "wagmi/actions"
import { ClientOnly } from "@/components/client-only"
import { ipfsMock } from "@/lib/ipfs-mock"

const steps = [
  { id: 1, title: "Contract Details", description: "Basic information about your contract" },
  { id: 2, title: "Version & Compiler", description: "Specify version and compiler settings" },
  { id: 3, title: "License", description: "Choose your contract license" },
  { id: 4, title: "Source Code", description: "Upload your contract source code" },
  { id: 5, title: "Review & Submit", description: "Review and submit to blockchain" },
]

const compilers = ["solc-0.8.19", "solc-0.8.18", "solc-0.8.17", "solc-0.8.16", "solc-0.8.15"]

const licenses = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "Unlicense"]

function SubmitSourceFormInner() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    compiler: "",
    license: "",
    sourceCode: "",
  })
  const { isConnected, chainId, isWrongNetwork, switchToSepolia, isSwitchingNetwork } = useWallet()
  const { toast } = useToast()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    console.log("[v0] handleSubmit started", { isConnected, chainId, isWrongNetwork })

    if (!isConnected) {
      console.log("[v0] Wallet not connected")
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit.",
        variant: "destructive",
      })
      return
    }
    if (isWrongNetwork) {
      console.log("[v0] Wrong network", { chainId })
      toast({
        title: "Wrong network",
        description: "Please switch to Sepolia before submitting.",
        variant: "destructive",
      })
      return
    }
    if (!formData.name || !formData.version || !formData.compiler || !formData.license || !formData.sourceCode) {
      console.log("[v0] Missing fields", formData)
      toast({
        title: "Missing fields",
        description: "Please complete all steps before submitting.",
        variant: "destructive",
      })
      return
    }
    const address = SOURCE_REGISTRY_ADDRESSES[chainId]
    if (!address) {
      console.log("[v0] Unsupported network", { chainId })
      toast({
        title: "Unsupported network",
        description: "Please switch to Sepolia to submit sources.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting transaction with address:", address)
    setIsSubmitting(true)
    setTxHash(null)

    try {
      // NOTE: Replace this placeholder with a real IPFS CID once integrated.
      const normalizedSource = (formData.sourceCode || "").trim()
      if (!normalizedSource) {
        throw new Error("Source code is required")
      }

      console.log("[v0] Uploading source to IPFS mock...")
      const ipfsCID = await ipfsMock.putText(normalizedSource)
      console.log("[v0] Generated IPFS CID:", ipfsCID)

      console.log("[v0] Calling writeContract with args:", [
        formData.name,
        formData.version,
        formData.compiler,
        formData.license,
        ipfsCID,
      ])

      const hash = await writeContract(wagmiConfig, {
        abi: sourceRegistryAbi,
        address,
        functionName: "submitSource",
        args: [formData.name, formData.version, formData.compiler, formData.license, ipfsCID],
      })
      console.log("[v0] Transaction hash:", hash)
      setTxHash(hash)

      console.log("[v0] Waiting for transaction receipt...")
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash })
      console.log("[v0] Transaction confirmed:", receipt)

      setIsSubmitting(false)
      setShowSuccess(true)
      console.log("[v0] Submit source completed successfully")
    } catch (err: any) {
      console.error("[v0] submitSource error:", err?.message || err)
      console.error("[v0] Full error object:", err)
      setIsSubmitting(false)
      toast({
        title: "Transaction failed",
        description: err?.shortMessage || err?.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Progress bar */}
        <ProgressBar progress={progress} />

        {/* Steps indicator */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.id <= currentStep
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {step.id < currentStep ? "✓" : step.id}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                    step.id < currentStep ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
          {isWrongNetwork && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-red-500/40 bg-red-500/10 p-3">
              <div className="text-sm text-red-200">
                You are connected to the wrong network. Please switch to Sepolia.
              </div>
              <Button
                onClick={switchToSepolia}
                variant="outline"
                size="sm"
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 bg-transparent"
                disabled={isSwitchingNetwork}
              >
                {isSwitchingNetwork ? "Switching…" : "Switch to Sepolia"}
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h2>
                <p className="text-slate-400">{steps[currentStep - 1].description}</p>
              </div>

              {/* Step content */}
              <div className="space-y-6">
                {currentStep === 1 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Contract Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        placeholder="MyContract"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version" className="text-white">
                        Version
                      </Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => updateFormData("version", e.target.value)}
                        placeholder="1.0.0"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Solidity Compiler</Label>
                      <Select value={formData.compiler} onValueChange={(value) => updateFormData("compiler", value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select compiler version" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {compilers.map((compiler) => (
                            <SelectItem key={compiler} value={compiler} className="text-white hover:bg-slate-700">
                              {compiler}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">License</Label>
                      <Select value={formData.license} onValueChange={(value) => updateFormData("license", value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select license" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {licenses.map((license) => (
                            <SelectItem key={license} value={license} className="text-white hover:bg-slate-700">
                              {license}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Source Code</Label>
                      <CodeEditor
                        value={formData.sourceCode}
                        onChange={(value) => updateFormData("sourceCode", value)}
                        language="solidity"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contract Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Name:</span>
                            <span className="text-white">{formData.name || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Version:</span>
                            <span className="text-white">{formData.version || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Compiler:</span>
                            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                              {formData.compiler || "Not selected"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">License:</span>
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                              {formData.license || "Not selected"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Source Code Preview</h3>
                        <div className="bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                          <pre className="text-sm text-slate-300 font-mono">
                            {formData.sourceCode || "No source code provided"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 bg-transparent"
            >
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isWrongNetwork}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white min-w-[120px]"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  "Submit to Blockchain"
                )}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Source Code Submitted Successfully!"
        description="Your contract source code has been submitted on-chain."
        explorerLink={
          txHash
            ? chainId === 11155111
              ? `https://sepolia.etherscan.io/tx/${txHash}`
              : `https://etherscan.io/tx/${txHash}`
            : undefined
        }
      />
    </>
  )
}

export function SubmitSourceForm() {
  return (
    <ClientOnly
      fallback={
        <div className="space-y-8">
          <div className="h-2 bg-slate-700 rounded-full animate-pulse" />
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
                {step < 5 && <div className="w-16 h-0.5 mx-2 bg-slate-700" />}
              </div>
            ))}
          </div>
          <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-6 bg-slate-700 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-slate-700 rounded animate-pulse w-2/3" />
              </div>
              <div className="space-y-4">
                <div className="h-10 bg-slate-700 rounded animate-pulse" />
                <div className="h-10 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        </div>
      }
    >
      <SubmitSourceFormInner />
    </ClientOnly>
  )
}
