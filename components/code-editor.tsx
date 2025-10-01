"use client"

import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  placeholder?: string
  readOnly?: boolean
  filename?: string
}

export function CodeEditor({
  value,
  onChange,
  language = "solidity",
  placeholder,
  readOnly = false,
  filename = "contract.sol",
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const mockCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SampleContract
 * @dev Example smart contract demonstrating basic Solidity features
 */
contract SampleContract {
    address public owner;
    uint256 public counter;
    
    event CounterIncremented(uint256 newValue);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
        counter = 0;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    function increment() public {
        counter += 1;
        emit CounterIncremented(counter);
    }
    
    function getCounter() public view returns (uint256) {
        return counter;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}`

  const defaultPlaceholder = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // Your contract code here
    
    constructor() {
        // Constructor logic
    }
    
    function myFunction() public pure returns (string memory) {
        return "Hello, Somnia!";
    }
}`

  const handleCopy = async () => {
    const codeToCopy = value || mockCode
    try {
      await navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied successfully",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const codeToDownload = value || mockCode
    const blob = new Blob([codeToDownload], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Download started",
      description: `${filename} is being downloaded`,
    })
  }

  const renderHighlighted = (code: string) => {
    if (!code) return null

    const keywords = new Set([
      "pragma",
      "contract",
      "function",
      "constructor",
      "public",
      "private",
      "pure",
      "view",
      "returns",
      "modifier",
      "require",
      "emit",
      "event",
      "address",
      "indexed",
    ])
    const types = new Set(["string", "uint256", "address", "bool", "memory"])

    return code.split("\n").map((line, i) => {
      const parts = line.split(" ")
      return (
        <div key={i}>
          {parts.map((word, j) => {
            let cls = ""
            if (word.startsWith("//") || word.startsWith("/*") || word.startsWith("*")) cls = "text-green-400"
            else if (keywords.has(word)) cls = "text-purple-400"
            else if (types.has(word)) cls = "text-cyan-400"
            return (
              <span key={j} className={cls}>
                {word}
                {j < parts.length - 1 ? " " : ""}
              </span>
            )
          })}
        </div>
      )
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300 font-mono">{language}</div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>
        </div>
      </div>

      {readOnly && (
        <div className="absolute top-14 right-3 z-10 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className="bg-slate-700/80 hover:bg-slate-600 text-white"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            className="bg-slate-700/80 hover:bg-slate-600 text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {readOnly ? (
        <div
          className="max-h-[600px] overflow-y-auto bg-slate-900/50 border border-slate-600 rounded-md text-white font-mono text-sm leading-relaxed pt-12 px-3 pb-3"
          role="region"
          aria-label="Code preview"
        >
          <pre className="whitespace-pre-wrap">{renderHighlighted(value || mockCode)}</pre>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="min-h-[400px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm leading-relaxed pt-12 focus:border-purple-500 resize-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }}
        />
      )}
    </motion.div>
  )
}
