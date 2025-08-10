"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Key, Trash2, Search, Pencil, Command } from 'lucide-react'
import CreateSystemDialog from "./create-system-dialog"
import SystemApiKeyDialog from "./system-api-key-dialog"
import SystemEditDialog from "./system-edit-dialog"
import { cn } from "@/lib/utils"
import IngestApiDialog from "./ingest-api-dialog"
import { useRouter } from "next/navigation"
import type { System } from "@/lib/types"
import { getStatusForSystem } from "@/lib/utils-versions"
import toast from "react-hot-toast"


const apiDeleteSystem = async (id: string) => {
  try {
    const res = await fetch(`/api/systems?id=${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      if (!document.getElementById("delete-system-toast")) {
        toast.error(data.error || "Failed to delete system", { id: "delete-system-toast" })
      }
      throw new Error(data.error || "Failed to delete system")
    }
    if (!document.getElementById("delete-system-toast")) {
      toast.success("System deleted", { id: "delete-system-toast" })
    }
    return res.json()
  } catch (e: any) {
    if (!document.getElementById("delete-system-toast")) {
      toast.error(e.message || "Failed to delete system", { id: "delete-system-toast" })
    }
    throw e
  }
}

export default function SystemsTable({ systems = [] as System[] }) {
  const [q, setQ] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [localSystems, setLocalSystems] = useState<System[]>(systems)

  useEffect(() => {
    setLocalSystems(systems)
  }, [systems])

  // Function to refresh systems from API
  const refreshSystems = async () => {
    try {
      const res = await fetch('/api/systems')
      if (res.ok) {
        const updatedSystems = await res.json()
        setLocalSystems(updatedSystems)
      }
    } catch (error) {
      console.error('Failed to refresh systems:', error)
    }
  }

  // Callback for when a system is created
  const handleSystemCreated = async (newSystem: System) => {
    toast.success("System created", { id: "create-system-toast" })
    await refreshSystems()
  }

  // Callback for when a system is updated
  const handleSystemUpdated = async () => {
    toast.success("System updated", { id: "update-system-toast" })
    await refreshSystems()
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return localSystems.filter((sys) => {
      if (!s) return true
      return (
        sys.name.toLowerCase().includes(s) ||
        sys.hostname.toLowerCase().includes(s) ||
        sys.tags.some((t) => t.name.toLowerCase().includes(s))
      )
    })
  }, [q, localSystems])

  const router = useRouter()

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
              <TableHead>Versions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const status = getStatusForSystem(s, s.baselines)
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
                      {s.tags.map((t: any) => (
                        <span key={t.id} className="rounded-full bg-muted border px-2 py-0.5 text-xs">{t.name}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {s.baselines.length === 0 ? (
                        <span className="rounded-full border px-2.5 py-0.5 text-[11px] bg-muted">No baselines</span>
                      ) : (
                        s.baselines.map((b) => {
                          const val = s.baselineValues?.find((bv) => bv.baselineId === b.id)?.value
                          return (
                            <span key={b.id} className="rounded-full border px-2.5 py-0.5 text-[11px] bg-muted">
                              {b.name}: {val ? val : <span className="text-muted-foreground">(no value)</span>}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", badgeClass)}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                      {/* Ingest API */}
                      <IngestApiDialog
                        system={s}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-full sm:w-8 justify-start sm:justify-center" aria-label="Ingest API">
                            <Command className="w-4 h-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Ingest API</span>
                          </Button>
                        }
                      />
                      {/* Edit */}
                      <SystemEditDialog
                        system={s}
                        onSystemUpdated={handleSystemUpdated}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto justify-start sm:justify-center">
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
                          <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto justify-start sm:justify-center">
                            <Key className="w-4 h-4 mr-1" />
                            API key
                          </Button>
                        }
                      />
                      {/* Delete */}
                      <Button variant="ghost" size="sm" className="h-8 w-full sm:w-auto justify-start sm:justify-center" onClick={async () => { 
                        await apiDeleteSystem(s.id); 
                        await refreshSystems();
                      }}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <CreateSystemDialog open={openCreate} onOpenChange={setOpenCreate} onSystemCreated={handleSystemCreated} />
    </Card>
  )
}
