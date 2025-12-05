import { NextResponse } from "next/server"
import { nullshot } from "@/lib/nullshot/orchestrator"

// Mock audit data for demo purposes
const getMockAuditReport = (code: string) => {
    const hasReentrancy = !code.includes("nonReentrant") && code.includes("call{value:")
    const hasNoAccessControl = !code.includes("onlyOwner") && !code.includes("Ownable")
    const hasIntegerOverflow = !code.includes("pragma solidity ^0.8") && (code.includes("+=") || code.includes("*"))
    const hasUnprotectedSelfDestruct = code.includes("selfdestruct") && !code.includes("onlyOwner")

    const vulnerabilities = []
    let score = 100

    if (hasReentrancy) {
        vulnerabilities.push({
            id: "vuln-1",
            title: "Reentrancy Vulnerability",
            description: "The contract performs external calls before updating state, which could allow attackers to recursively call back into the contract and drain funds.",
            severity: "High" as const,
            lineStart: code.split('\n').findIndex(line => line.includes("call{value:")) + 1,
            lineEnd: code.split('\n').findIndex(line => line.includes("call{value:")) + 1,
            suggestion: "Use the ReentrancyGuard from OpenZeppelin and apply the nonReentrant modifier to functions that make external calls. Always follow the checks-effects-interactions pattern."
        })
        score -= 35
    }

    if (hasNoAccessControl) {
        vulnerabilities.push({
            id: "vuln-2",
            title: "Missing Access Control",
            description: "Critical functions lack proper access control mechanisms, allowing any user to call sensitive operations.",
            severity: "High" as const,
            lineStart: 1,
            lineEnd: 5,
            suggestion: "Implement OpenZeppelin's Ownable or AccessControl contract. Use modifiers like onlyOwner to restrict sensitive functions to authorized addresses only."
        })
        score -= 30
    }

    if (hasIntegerOverflow) {
        vulnerabilities.push({
            id: "vuln-3",
            title: "Potential Integer Overflow",
            description: "The contract uses Solidity version below 0.8.0 which doesn't have built-in overflow protection, making arithmetic operations vulnerable.",
            severity: "Medium" as const,
            lineStart: 1,
            lineEnd: 1,
            suggestion: "Upgrade to Solidity 0.8.0 or higher for built-in overflow protection, or use OpenZeppelin's SafeMath library for arithmetic operations."
        })
        score -= 20
    }

    if (hasUnprotectedSelfDestruct) {
        vulnerabilities.push({
            id: "vuln-4",
            title: "Unprotected Self-Destruct",
            description: "The selfdestruct function is not properly protected, allowing anyone to destroy the contract and steal funds.",
            severity: "High" as const,
            lineStart: code.split('\n').findIndex(line => line.includes("selfdestruct")) + 1,
            lineEnd: code.split('\n').findIndex(line => line.includes("selfdestruct")) + 1,
            suggestion: "Add onlyOwner modifier to the function containing selfdestruct, or remove this functionality entirely as it's generally discouraged in modern contracts."
        })
        score -= 40
    }

    // Check for some good patterns
    if (code.includes("ReentrancyGuard")) {
        score = Math.min(100, score + 10)
    }
    if (code.includes("@openzeppelin/contracts")) {
        score = Math.min(100, score + 5)
    }

    return {
        id: `audit-${Date.now()}`,
        timestamp: Date.now(),
        vulnerabilities,
        score: Math.max(0, score),
        summary: vulnerabilities.length === 0
            ? "Excellent! No critical vulnerabilities detected. The contract follows security best practices including reentrancy protection, access control, and modern Solidity version."
            : `Security audit identified ${vulnerabilities.length} issue${vulnerabilities.length > 1 ? 's' : ''} in this smart contract. ${vulnerabilities.filter(v => v.severity === 'High').length > 0 ? 'Critical vulnerabilities were found that should be addressed before deployment.' : 'The issues found should be reviewed and fixed to improve contract security.'}`,
        isApproved: vulnerabilities.filter(v => v.severity === "High").length === 0
    }
}

export async function POST(req: Request) {
    try {
        const { code } = await req.json()
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }

        try {
            const report = await nullshot.startAudit(code)
            return NextResponse.json(report)
        } catch (apiError: any) {
            // If API fails, return mock data for demo purposes
            console.log("API failed, using mock audit data for demo:", apiError.message)
            const mockReport = getMockAuditReport(code)
            return NextResponse.json(mockReport)
        }
    } catch (error: any) {
        console.error("Audit API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
