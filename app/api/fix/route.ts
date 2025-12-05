import { NextResponse } from "next/server"
import { nullshot } from "@/lib/nullshot/orchestrator"

export async function POST(req: Request) {
    try {
        const { code, vulnerability } = await req.json()
        if (!code || !vulnerability) {
            return NextResponse.json({ error: "Code and vulnerability are required" }, { status: 400 })
        }

        const suggestion = await nullshot.generateFix(code, vulnerability)
        return NextResponse.json(suggestion)
    } catch (error: any) {
        console.error("Fix API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
