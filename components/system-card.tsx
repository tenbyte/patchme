"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { Globe } from 'lucide-react'
import Link from "next/link"
import { format } from "date-fns"
import { getStatusForSystem } from "@/lib/utils-versions"
import type { System } from "@/lib/types"
import { useState } from "react"

function StatusDot({ status }: { status: "Ok" | "Warning" }) {
  const color = status === "Ok" ? "bg-emerald-500" : "bg-amber-500"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} aria-hidden="true" />
}

// Helper function to ensure proper URL format
function formatUrl(hostname: string): string {
  if (!hostname) return "#"
  
  // If it already starts with http:// or https://, use as-is
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    return hostname
  }
  
  // If it's just a domain/hostname, add https://
  return `https://${hostname}`
}

const pillVersion = "rounded-full border px-2.5 py-0.5 text-[11px]"
const pillTag = "rounded-full border px-2 py-0.5 text-[11px] bg-background"

export default function SystemCard({ system }: { system: System }) {
  const status = getStatusForSystem(system, system.baselines)
  const [showAllVersions, setShowAllVersions] = useState(false)

  // Zeige die Baselines mit IST-Version (aus baselineValues) an
  const maxBadges = showAllVersions ? system.baselines?.length || 0 : 3
  const shown = (system.baselines || []).slice(0, maxBadges)
  const versionMore = (system.baselines?.length || 0) - shown.length

  const allVersionsContent = (
    <div className="space-y-2">
      <div className="font-medium text-sm">All Versions for {system.name}</div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {(system.baselines || []).map((b) => {
          const val = system.baselineValues?.find((bv) => bv.baselineId === b.id)?.value
          const getRequiredText = () => {
            if (b.type === "INFO") return "Info only"
            if (b.type === "MAX") return `≤ ${b.minVersion}`
            return `≥ ${b.minVersion}` // MIN or default
          }
          return (
            <div key={b.id} className="text-xs p-2 bg-muted/50 rounded">
              <div className="font-medium">{b.name}</div>
              <div className="text-muted-foreground">
                Current: {val || "(no value)"} | Required: {getRequiredText()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Card 
      className="bg-card/60 transition-all hover:shadow-md cursor-pointer" 
      onClick={() => setShowAllVersions(!showAllVersions)}
    >
      <CardHeader className="pb-0 px-3 pt-3">
        <CardTitle className="text-sm flex items-start justify-between gap-2">
          <div className="space-y-0">
            <div className="font-semibold leading-tight">{system.name}</div>
            <Link
              href={formatUrl(system.hostname || "")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] leading-none text-muted-foreground inline-flex items-center gap-1 hover:underline"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
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
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex flex-wrap gap-1.5">
              {shown.length === 0 ? (
                <span className={cn(pillVersion, "bg-muted")}>No baselines</span>
              ) : (
                shown.map((b) => {
                  const val = system.baselineValues?.find((bv) => bv.baselineId === b.id)?.value
                  const hasWarning = (() => {
                    if (!val) return true;
                    if (b.type === "INFO") return false;
                    if (b.type === "MAX") return parseFloat(val) > parseFloat(b.minVersion);
                    return parseFloat(val) < parseFloat(b.minVersion); // MIN or default
                  })();
                  
                  const getVersionText = () => {
                    if (b.type === "INFO") {
                      return `${b.name}: ${val || "(no value)"}`
                    }
                    if (b.type === "MAX") {
                      return `${b.name}: ${val || "(no value)"} (≤ ${b.minVersion})`
                    }
                    return `${b.name}: ${val || "(no value)"} (≥ ${b.minVersion})` // MIN or default
                  }
                  return (
                    <span 
                      key={b.id} 
                      className={cn(
                        pillVersion,
                        hasWarning 
                          ? "bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/50" 
                          : "bg-muted"
                      )}
                    >
                      {getVersionText()}
                    </span>
                  )
                })
              )}
              {!showAllVersions && versionMore > 0 && (
                <span className={cn(pillVersion, "cursor-pointer hover:bg-muted/80 bg-muted")}>
                  +{versionMore} more
                </span>
              )}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            {allVersionsContent}
          </HoverCardContent>
        </HoverCard>
      </CardContent>
    </Card>
  )
}
