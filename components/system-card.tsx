"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe } from 'lucide-react'
import Link from "next/link"
import { format } from "date-fns"
import { getStatusForSystem } from "@/lib/utils-versions"
import type { System } from "@/lib/types"


function StatusDot({ status }: { status: "Ok" | "Warning" }) {
  const color = status === "Ok" ? "bg-emerald-500" : "bg-amber-500"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} aria-hidden="true" />
}

const pillVersion = "rounded-full border px-2.5 py-0.5 text-[11px] bg-muted"
const pillTag = "rounded-full border px-2 py-0.5 text-[11px] bg-background"

export default function SystemCard({ system }: { system: System }) {
  const status = getStatusForSystem(system, system.baselines)

  const maxBadges = 3
  const versionShown = system.baselines.slice(0, maxBadges)
  const versionMore = system.baselines.length - versionShown.length

  return (
    <Card className="bg-card/60">
      <CardHeader className="pb-0 px-3 pt-3">
        <CardTitle className="text-sm flex items-start justify-between gap-2">
          <div className="space-y-0">
            <div className="font-semibold leading-tight">{system.name}</div>
            <Link
              href={system.hostname || "#"}
              target="_blank"
              className="text-[11px] leading-none text-muted-foreground inline-flex items-center gap-1 hover:underline"
            >
              <div className="flex items-center gap-1 py-3">
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{system.hostname}</span>
              </div>
            </Link>
            <div className="text-[11px] leading-none text-muted-foreground">
              {system.lastSeen ? `Last seen ${format(new Date(system.lastSeen), "d.M.yyyy, HH:mm:ss")}` : "Never seen"}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {system.tags.map((t) => (
                <span key={t.id} className={pillTag}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 leading-none">
            <StatusDot status={status} />
            <span>{status}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {versionShown.length === 0 ? (
            <span className={pillVersion}>No baselines</span>
          ) : (
            versionShown.map((b) => (
              <span key={b.id} className={pillVersion}>
                {b.name}: {b.variable} ≥ {b.minVersion}
              </span>
            ))
          )}
          {versionMore > 0 && <span className={pillVersion}>+{versionMore} more</span>}
        </div>
      </CardContent>
    </Card>
  )
}
