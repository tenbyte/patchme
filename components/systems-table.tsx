"use client"

import { useMemo, useState } from "react"
import type { System } from "@/lib/store"
import { getStatusForSystem } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Key, Trash2, Search, Pencil, Command } from 'lucide-react'
import CreateSystemDialog from "./create-system-dialog"
import SystemApiKeyDialog from "./system-api-key-dialog"
import SystemEditDialog from "./system-edit-dialog"
import { deleteSystem } from "@/app/server-actions"
import { cn } from "@/lib/utils"
import IngestApiDialog from "./ingest-api-dialog"

export default function SystemsTable({ systems = [] as System[] }) {
  const [q, setQ] = useState("")
  const [openCreate, setOpenCreate] = useState(false)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return systems.filter((sys) => {
      if (!s) return true
      return (
        sys.name.toLowerCase().includes(s) ||
        sys.hostname.toLowerCase().includes(s) ||
        sys.tags.some((t) => t.toLowerCase().includes(s))
      )
    })
  }, [q, systems])

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold">Systems</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full md:w-60" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create system
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Global variables</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const status = getStatusForSystem(s)
              const badgeClass =
                status === "Ok"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                  : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.hostname}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full bg-muted border px-2 py-0.5 text-xs">{t}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.allowedVariables.join(", ")}
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", badgeClass)}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Ingest API */}
                      <IngestApiDialog
                        system={s}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ingest API">
                            <Command className="w-4 h-4" />
                          </Button>
                        }
                      />
                      {/* Edit */}
                      <SystemEditDialog
                        system={s}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8">
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        }
                      />
                      {/* API key */}
                      <SystemApiKeyDialog
                        systemId={s.id}
                        currentKey={s.apiKey}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8">
                            <Key className="w-4 h-4 mr-1" />
                            API key
                          </Button>
                        }
                      />
                      {/* Delete */}
                      <form action={deleteSystem.bind(null, s.id)}>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <CreateSystemDialog open={openCreate} onOpenChange={setOpenCreate} />
    </Card>
  )
}
