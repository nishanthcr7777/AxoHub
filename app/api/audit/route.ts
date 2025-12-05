import { NextResponse } from "next/server"
import { nullshot } from "@/lib/nullshot/orchestrator"

export async function POST(req: Request) {
    try {
        const { code } = await req.json()
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }

        const report = await nullshot.startAudit(code)
        return NextResponse.json(report)
    } catch (error: any) {
        console.error("Audit API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
