import { NextRequest, NextResponse } from "next/server"
import { getActivityLogs } from "@/lib/activitylog"

export async function GET(req: NextRequest) {
  const logs = await getActivityLogs(100)
  return NextResponse.json(logs)
}
