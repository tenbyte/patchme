"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { System } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Globe } from 'lucide-react'
import Link from "next/link"
import { getStatusForSystem } from "@/lib/store"
import { format } from "date-fns"

type Props = {
  system?: System
}

const defaultSystem: System = {
  id: "demo",
  name: "Example",
  hostname: "https://example.com",
  tags: ["prod"],
  apiKey: "pm_DEMOXXX",
  lastSeen: undefined,
  variables: { PHP_Version: "8.3.0" },
  allowedVariables: ["PHP_Version"],
}

function StatusDot({ status }: { status: "Ok" | "Warning" }) {
  const color = status === "Ok" ? "bg-emerald-500" : "bg-amber-500"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} aria-hidden="true" />
}

const pillVersion = "rounded-full border px-2.5 py-0.5 text-[11px] bg-muted"
const pillTag = "rounded-full border px-2 py-0.5 text-[11px] bg-background"

export default function SystemCard({ system = defaultSystem }: Props) {
  const status = getStatusForSystem(system)

  const entries = Object.entries(system.variables)
  const versions = entries.filter(([k]) => /version/i.test(k))
  const others = entries.filter(([k]) => !/version/i.test(k))

  const maxBadges = 3
  const versionShown = versions.slice(0, maxBadges)
  const versionMore = versions.length - versionShown.length

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
              <span key={t} className={pillTag}>
                {t}
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
            <span className={pillVersion}>No versions</span>
          ) : (
            versionShown.map(([k, v]) => (
              <span key={k} className={pillVersion}>
                {k.replace(/_/g, " ")}: {Array.isArray(v) ? v.join(", ") : v}
              </span>
            ))
          )}
          {versionMore > 0 && <span className={pillVersion}>+{versionMore} more</span>}
        </div>

        {others.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {others.slice(0, 2).map(([k, v]) => (
              <span key={k} className={pillVersion}>
                {k.replace(/_/g, " ")}: {Array.isArray(v) ? v.join(", ") : v}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
