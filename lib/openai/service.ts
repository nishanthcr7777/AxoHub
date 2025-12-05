import OpenAI from "openai"
import { AuditReport, FixSuggestion, Vulnerability } from "@/lib/nullshot/types"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Note: In a real production app, we should proxy this through a backend route.
})

export class OpenAIService {
    static async analyzeCode(code: string): Promise<AuditReport> {
        const prompt = `
      You are an expert smart contract auditor. Analyze the following Solidity code for security vulnerabilities, logical inconsistencies, and best practices.
      
      Code:
      ${code}
      
      Return a JSON object with the following structure:
      {
        "vulnerabilities": [
          {
            "id": "unique_id",
            "title": "Short title",
            "description": "Detailed description",
            "severity": "High" | "Medium" | "Low",
            "lineStart": number,
            "lineEnd": number,
            "suggestion": "Brief suggestion"
          }
        ],
        "score": number (0-100, where 100 is perfectly secure),
        "summary": "Brief summary of the audit",
        "isApproved": boolean (true if no High severity issues)
      }
    `

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo if cost is a concern, but gpt-4 is better for code.
                response_format: { type: "json_object" },
            })

            const content = completion.choices[0].message.content
            if (!content) throw new Error("No content returned from OpenAI")

            const result = JSON.parse(content)

            return {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                ...result
            }
        } catch (error) {
            console.error("OpenAI Analysis Error:", error)
            // Return a fallback or rethrow
            throw error
        }
    }

    static async generateFix(code: string, vulnerability: Vulnerability): Promise<FixSuggestion> {
        const prompt = `
      You are an expert smart contract developer. Fix the following vulnerability in the provided code.
      
      Vulnerability: ${vulnerability.title} - ${vulnerability.description}
      
      Code:
      ${code}
      
      Return a JSON object with the following structure:
      {
        "fixedCode": "The complete fixed code",
        "explanation": "Explanation of the fix"
      }
    `

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo-preview",
                response_format: { type: "json_object" },
            })

            const content = completion.choices[0].message.content
            if (!content) throw new Error("No content returned from OpenAI")

            const result = JSON.parse(content)

            return {
                vulnerabilityId: vulnerability.id,
                originalCode: code,
                fixedCode: result.fixedCode,
                explanation: result.explanation,
            }
        } catch (error) {
            console.error("OpenAI Fix Generation Error:", error)
            throw error
        }
    }

    static async generateCode(prompt: string): Promise<{ code: string; explanation: string }> {
        const systemPrompt = `
      You are an expert smart contract developer. Write a robust, secure, and gas-optimized Solidity smart contract based on the user's request.
      
      Return a JSON object with the following structure:
      {
        "code": "The complete Solidity code, including SPDX license and pragma",
        "explanation": "Brief explanation of the contract's functionality and key features"
      }
    `

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt },
                ],
                model: "gpt-4-turbo-preview",
                response_format: { type: "json_object" },
            })

            const content = completion.choices[0].message.content
            if (!content) throw new Error("No content returned from OpenAI")

            const result = JSON.parse(content)

            return {
                code: result.code,
                explanation: result.explanation,
            }
        } catch (error) {
            console.error("OpenAI Code Generation Error:", error)
            throw error
        }
    }
}
