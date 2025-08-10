"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ShieldCheck, AlertTriangle, Server, FilterX, Activity } from 'lucide-react'
import SystemCard from "./system-card"
import CreateSystemDialog from "./create-system-dialog"
import CreateBaselineDialog from "./create-baseline-dialog"
import { format } from "date-fns"
import type { System, Baseline, ActivityLog, Tag } from "@/lib/types"
import { useMemo } from "react"


const defaultProps: Required<Props> = {
  systems: [],
  baselines: [],
  activity: [],
  tags: [],
  counts: { total: 0, ok: 0, warnings: 0 },
}

type Props = {
  systems?: System[]
  baselines?: Baseline[]
  activity?: ActivityLog[]
  tags?: Tag[]
  counts?: { total: number; ok: number; warnings: number }
}

function formatLogLine(log: ActivityLog) {
  const ts = log.createdAt ? format(new Date(log.createdAt), "d.M.yyyy, HH:mm:ss") : ""
  const sys = log.systemName ?? "Unknown"
  let metaPreview = ""
  if (log.meta && Array.isArray(log.meta.versions)) {
    const allVersions = log.meta.versions.map((e: { variable: string; version: string }) => {
      return `${e.variable}=${e.version}`
    })
    metaPreview = allVersions.join(", ")
  }
  return `[${ts}] ${sys}: ${metaPreview}`
}

export default function Dashboard(p: Props) {
  const { systems, baselines, activity, tags, counts: countsProp } = { ...defaultProps, ...p }

  const [query, setQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [openBaseline, setOpenBaseline] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dashboardCounts, setDashboardCounts] = useState(countsProp)

  useEffect(() => {
    fetch("/api/systems/counts")
      .then(r => r.json())
      .then(setDashboardCounts)
      .catch(() => setDashboardCounts(countsProp))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return systems.filter((s: System) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.hostname.toLowerCase().includes(q) ||
        s.baselines.some((b: Baseline) =>
          b.name.toLowerCase().includes(q) ||
          b.variable.toLowerCase().includes(q) ||
          b.minVersion.toLowerCase().includes(q)
        )
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((id) => s.tags.some((tag: Tag) => tag.id === id))
      return matchesQuery && matchesTags
    })
  }, [systems, query, selectedTags])

  const toggleTag = (t: string) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-bold">Dashboard</div>
          <div className="text-muted-foreground text-sm">Overview of your systems</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search systems and entries..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
          <Button variant="outline" onClick={() => setOpenBaseline(true)}>
            Add baseline
          </Button>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create system
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Tag filters:</span>
        {tags.map((t: Tag) => (
          <button
            key={t.id}
            onClick={() => toggleTag(t.id)}
            className={[
              "rounded-full px-3 py-1 text-sm border transition-colors",
              selectedTags.includes(t.id) ? "bg-foreground text-background" : "bg-muted hover:bg-muted/80",
            ].join(" ")}
            aria-pressed={selectedTags.includes(t.id)}
          >
            {t.name}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="gap-1">
            <FilterX className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              # Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              # OK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardCounts.ok}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              # Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardCounts.warnings}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Systems</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No systems found.</div>
          ) : (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {filtered.map((s: System) => (
                <SystemCard key={s.id} system={s} />
              ))}
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Baselines: {baselines.length}</Badge>
            <Badge variant="secondary">Tags: {tags.length}</Badge>
            <Badge variant="secondary">OK: {dashboardCounts.ok}</Badge>
            <Badge variant="secondary">Warnings: {dashboardCounts.warnings}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Inbound Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm rounded-md border bg-muted/50 p-3 max-h-[40vh] overflow-y-auto">
            {activity.length === 0 ? (
              <div className="text-muted-foreground">
                No inbound logs yet. Logs appear when agents POST to {'/api/ingest'}.
              </div>
            ) : (
              <ul className="space-y-1">
                {activity.slice(0, 100).map((log: ActivityLog) => (
                  <li key={log.id} className="whitespace-pre-wrap">
                    {formatLogLine(log)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateSystemDialog open={openCreate} onOpenChange={setOpenCreate} />
      <CreateBaselineDialog open={openBaseline} onOpenChange={setOpenBaseline} />
    </div>
  )
}
