import { NextResponse } from "next/server"
import { ingestEntries } from "@/lib/store"

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 })
    }
    const body = await req.json()
    if (typeof body?.key !== "string" || !Array.isArray(body?.entries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const result = await ingestEntries(body.key, body.entries)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 })
    }
    return NextResponse.json({ ok: true, updated: result.updated })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
