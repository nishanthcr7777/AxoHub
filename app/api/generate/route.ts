import { NextResponse } from "next/server"
import { GeminiService } from "@/lib/gemini/service"

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        const result = await GeminiService.generateCode(prompt)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Generate Code API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
