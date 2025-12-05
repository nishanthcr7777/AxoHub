import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
    private static client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    private static model = GeminiService.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    static async analyzeCode(code: string) {
        const prompt = `You are an expert smart contract auditor. Analyze the following Solidity code and return a JSON object with the audit report. Use the following structure:\n{\n  "vulnerabilities": [],\n  "score": 0,\n  "summary": "",\n  "isApproved": true\n}`;
        const result = await GeminiService.model.generateContent([`Code:\n${code}`, prompt]);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');
        return JSON.parse(text);
    }

    static async generateFix(code: string, vulnerability: any) {
        const prompt = `You are an expert smart contract developer. Fix the following vulnerability in the provided code.\nVulnerability: ${vulnerability.title} - ${vulnerability.description}\nCode:\n${code}\nReturn a JSON object with fields \"fixedCode\" and \"explanation\".`;
        const result = await GeminiService.model.generateContent(prompt);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');
        const parsed = JSON.parse(text);
        return { vulnerabilityId: vulnerability.id, originalCode: code, fixedCode: parsed.fixedCode, explanation: parsed.explanation };
    }

    static async generateCode(prompt: string) {
        const systemPrompt = `You are an expert smart contract developer. Write a robust, secure, and gas-optimized Solidity smart contract based on the user's request. Return a JSON object with fields \"code\" and \"explanation\`.\nUser Prompt: ${prompt}`;
        const result = await GeminiService.model.generateContent(systemPrompt);
        const text = result.response?.text();
        if (!text) throw new Error('No response from Gemini');
        const parsed = JSON.parse(text);
        return { code: parsed.code, explanation: parsed.explanation };
    }
}
