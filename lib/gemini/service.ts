import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
    private static client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    private static model = GeminiService.client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
        }
    });

    /**
     * Extracts and parses JSON from the response text, handling markdown code blocks
     */
    private static parseJsonResponse(text: string): any {
        try {
            // Try direct JSON parse first
            return JSON.parse(text);
        } catch {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1].trim());
            }

            // Try to find JSON object in the text
            const objectMatch = text.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                return JSON.parse(objectMatch[0]);
            }

            throw new Error('Could not parse JSON from response');
        }
    }

    static async analyzeCode(code: string) {
        const prompt = `You are an expert smart contract auditor. Analyze the following Solidity code and return ONLY a valid JSON object (no markdown, no explanatory text).

Required JSON structure:
{
  "id": "unique-audit-id",
  "timestamp": <unix-timestamp>,
  "vulnerabilities": [
    {
      "id": "vuln-1",
      "title": "Vulnerability Title",
      "description": "Description of the issue",
      "severity": "High" | "Medium" | "Low",
      "lineStart": <number>,
      "lineEnd": <number>,
      "suggestion": "How to fix it"
    }
  ],
  "score": <0-100>,
  "summary": "Overall audit summary",
  "isApproved": <boolean>
}

Code to analyze:
${code}

Return ONLY the JSON object, nothing else.`;

        const result = await GeminiService.model.generateContent(prompt);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');

        const parsed = GeminiService.parseJsonResponse(text);

        // Add required fields if missing
        if (!parsed.id) parsed.id = `audit-${Date.now()}`;
        if (!parsed.timestamp) parsed.timestamp = Date.now();

        return parsed;
    }

    static async generateFix(code: string, vulnerability: any) {
        const prompt = `You are an expert smart contract developer. Fix the following vulnerability in the Solidity code.

Vulnerability Details:
- Title: ${vulnerability.title}
- Description: ${vulnerability.description}
- Severity: ${vulnerability.severity}

Original Code:
${code}

Return ONLY a valid JSON object (no markdown, no explanatory text) with this structure:
{
  "fixedCode": "The complete fixed Solidity code",
  "explanation": "Detailed explanation of what was changed and why"
}`;

        const result = await GeminiService.model.generateContent(prompt);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');

        const parsed = GeminiService.parseJsonResponse(text);

        return {
            vulnerabilityId: vulnerability.id,
            originalCode: code,
            fixedCode: parsed.fixedCode,
            explanation: parsed.explanation
        };
    }

    static async generateCode(prompt: string) {
        const systemPrompt = `You are an expert Solidity smart contract developer. Write a robust, secure, and gas-optimized smart contract based on the user's request.

User Request:
${prompt}

Return ONLY a valid JSON object (no markdown, no explanatory text) with this structure:
{
  "code": "The complete Solidity smart contract code with SPDX license, pragma, and all necessary imports",
  "explanation": "Detailed explanation of the contract, its features, security considerations, and usage instructions"
}`;

        const result = await GeminiService.model.generateContent(systemPrompt);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');

        const parsed = GeminiService.parseJsonResponse(text);

        return { code: parsed.code, explanation: parsed.explanation };
    }
}
