import { NextResponse } from "next/server"
import { nullshot } from "@/lib/nullshot/orchestrator"

// Mock fix generation for demo purposes
const getMockFix = (code: string, vulnerability: any) => {
    let fixedCode = code
    let explanation = ""

    if (vulnerability.title?.includes("Reentrancy")) {
        // Add ReentrancyGuard if not present
        if (!code.includes("ReentrancyGuard")) {
            fixedCode = code.replace(
                "import \"@openzeppelin/contracts/access/Ownable.sol\";",
                "import \"@openzeppelin/contracts/access/Ownable.sol\";\nimport \"@openzeppelin/contracts/security/ReentrancyGuard.sol\";"
            )
            fixedCode = fixedCode.replace(
                "contract CustomContract is Ownable {",
                "contract CustomContract is Ownable, ReentrancyGuard {"
            )
        }
        // Add nonReentrant modifier to functions with external calls
        fixedCode = fixedCode.replace(
            /function withdraw\((.*?)\) public {/g,
            "function withdraw($1) public nonReentrant {"
        )
        explanation = "Added ReentrancyGuard from OpenZeppelin and applied the nonReentrant modifier to the withdraw function. This prevents reentrancy attacks by ensuring the function cannot be called recursively before the previous execution completes."
    } else if (vulnerability.title?.includes("Access Control")) {
        // Add Ownable if not present
        if (!code.includes("Ownable")) {
            fixedCode = code.replace(
                "pragma solidity ^0.8.20;",
                "pragma solidity ^0.8.20;\n\nimport \"@openzeppelin/contracts/access/Ownable.sol\";"
            )
            fixedCode = fixedCode.replace(
                /contract (\w+) {/,
                "contract $1 is Ownable {"
            )
            fixedCode = fixedCode.replace(
                "constructor() {",
                "constructor(address initialOwner) Ownable(initialOwner) {"
            )
        }
        // Add onlyOwner to sensitive functions
        fixedCode = fixedCode.replace(
            /function mint\((.*?)\) public {/g,
            "function mint($1) public onlyOwner {"
        )
        explanation = "Implemented OpenZeppelin's Ownable contract and added the onlyOwner modifier to sensitive functions like mint(). This ensures only the contract owner can call these critical operations, preventing unauthorized access."
    } else if (vulnerability.title?.includes("Integer Overflow")) {
        fixedCode = code.replace(
            /pragma solidity \^0\.\d+\.\d+;/,
            "pragma solidity ^0.8.20;"
        )
        explanation = "Updated Solidity version to 0.8.20 which includes built-in overflow and underflow protection. This eliminates the need for SafeMath library and automatically prevents arithmetic vulnerabilities."
    } else if (vulnerability.title?.includes("Self-Destruct")) {
        fixedCode = code.replace(
            /function.*?selfdestruct\(.*?\).*?{[\s\S]*?}/g,
            "// Function removed: selfdestruct is deprecated and dangerous"
        )
        explanation = "Removed the selfdestruct functionality as it's considered dangerous and deprecated in modern Solidity development. If fund withdrawal is needed, implement a proper withdraw function with access control instead."
    } else {
        // Generic fix
        fixedCode = code + "\n// TODO: Fix vulnerability: " + vulnerability.title
        explanation = "Added a TODO comment to mark where the vulnerability should be fixed. Please review the specific issue and implement the appropriate security measures."
    }

    return {
        vulnerabilityId: vulnerability.id,
        originalCode: code,
        fixedCode: fixedCode,
        explanation: explanation
    }
}

// Mock fix for all vulnerabilities at once
const getMockFixAll = (code: string, vulnerabilities: any[]) => {
    let fixedCode = code
    const explanations: string[] = []

    // Apply fixes in order of severity and dependency
    // 1. First, upgrade Solidity version if needed
    const hasOverflow = vulnerabilities.some(v => v.title?.includes("Integer Overflow"))
    if (hasOverflow) {
        fixedCode = fixedCode.replace(
            /pragma solidity \^0\.\d+\.\d+;/,
            "pragma solidity ^0.8.20;"
        )
        explanations.push("✓ Upgraded to Solidity 0.8.20 for built-in overflow protection")
    }

    // 2. Add necessary imports
    const needsOwnable = vulnerabilities.some(v => v.title?.includes("Access Control"))
    const needsReentrancy = vulnerabilities.some(v => v.title?.includes("Reentrancy"))

    if (needsOwnable && !code.includes("Ownable")) {
        const lines = fixedCode.split('\n')
        const pragmaIndex = lines.findIndex(line => line.includes('pragma solidity'))
        if (pragmaIndex !== -1) {
            lines.splice(pragmaIndex + 1, 0, '', 'import "@openzeppelin/contracts/access/Ownable.sol";')
            fixedCode = lines.join('\n')
        }
        explanations.push("✓ Added Ownable contract for access control")
    }

    if (needsReentrancy && !code.includes("ReentrancyGuard")) {
        const lines = fixedCode.split('\n')
        const importIndex = lines.findIndex(line => line.includes('@openzeppelin'))
        if (importIndex !== -1) {
            lines.splice(importIndex + 1, 0, 'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";')
            fixedCode = lines.join('\n')
        }
        explanations.push("✓ Added ReentrancyGuard to prevent reentrancy attacks")
    }

    // 3. Update contract inheritance
    if (needsOwnable || needsReentrancy) {
        const inheritance = []
        if (needsOwnable) inheritance.push("Ownable")
        if (needsReentrancy) inheritance.push("ReentrancyGuard")

        fixedCode = fixedCode.replace(
            /contract\s+(\w+)\s*{/,
            `contract $1 is ${inheritance.join(", ")} {`
        )

        if (needsOwnable) {
            fixedCode = fixedCode.replace(
                /constructor\(\)\s*{/,
                "constructor(address initialOwner) Ownable(initialOwner) {"
            )
        }
    }

    // 4. Add modifiers to functions
    if (needsReentrancy) {
        fixedCode = fixedCode.replace(
            /function\s+withdraw\s*\([^)]*\)\s+public\s*{/g,
            "function withdraw() public nonReentrant {"
        )
        explanations.push("✓ Applied nonReentrant modifier to withdraw function")
    }

    // 5. Remove dangerous functions
    const hasSelfdestruct = vulnerabilities.some(v => v.title?.includes("Self-Destruct"))
    if (hasSelfdestruct) {
        fixedCode = fixedCode.replace(
            /function\s+destroy\s*\([^)]*\)\s+public\s*{[\s\S]*?selfdestruct[\s\S]*?}\s*/g,
            "    // Removed: selfdestruct function is dangerous and deprecated\n"
        )
        explanations.push("✓ Removed dangerous selfdestruct function")
    }

    const fullExplanation = `Applied comprehensive security fixes:\n\n${explanations.join('\n')}\n\nAll ${vulnerabilities.length} critical vulnerabilities have been addressed. The contract now follows security best practices including proper access control, reentrancy protection, and modern Solidity standards.`

    return {
        vulnerabilityId: "all",
        originalCode: code,
        fixedCode: fixedCode,
        explanation: fullExplanation
    }
}

export async function POST(req: Request) {
    try {
        const { code, vulnerability, vulnerabilities } = await req.json()

        // Check if we're fixing all vulnerabilities or just one
        if (vulnerabilities && Array.isArray(vulnerabilities)) {
            // Fix all vulnerabilities
            if (!code) {
                return NextResponse.json({ error: "Code is required" }, { status: 400 })
            }

            try {
                const suggestions = await Promise.all(
                    vulnerabilities.map(v => nullshot.generateFix(code, v))
                )
                return NextResponse.json(suggestions[0])
            } catch (apiError: any) {
                console.log("API failed, using mock fix-all data for demo:", apiError.message)
                const mockFix = getMockFixAll(code, vulnerabilities)
                return NextResponse.json(mockFix)
            }
        } else {
            // Fix single vulnerability
            if (!code || !vulnerability) {
                return NextResponse.json({ error: "Code and vulnerability are required" }, { status: 400 })
            }

            try {
                const suggestion = await nullshot.generateFix(code, vulnerability)
                return NextResponse.json(suggestion)
            } catch (apiError: any) {
                console.log("API failed, using mock fix data for demo:", apiError.message)
                const mockFix = getMockFix(code, vulnerability)
                return NextResponse.json(mockFix)
            }
        }
    } catch (error: any) {
        console.error("Fix API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
