"use client"

import { useMemo, useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Baseline } from "@/lib/types"
import toast from "react-hot-toast"

async function apiCreateBaseline({ name, variable, minVersion }: { name: string; variable: string; minVersion: string }) {
  const res = await fetch("/api/baselines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variable, minVersion }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to create baseline")
  }
  return res.json()
}

async function apiUpdateBaseline({ id, name, variable, minVersion }: { id: string; name: string; variable: string; minVersion: string }) {
  const res = await fetch(`/api/baselines?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variable, minVersion }),
  })
  if (!res.ok) throw new Error("Failed to update baseline")
  return res.json()
}

const apiDeleteBaseline = async (id: string) => {
  try {
    const res = await fetch(`/api/baselines?id=${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || "Failed to delete baseline", { id: "delete-baseline-toast" })
      throw new Error(data.error || "Failed to delete baseline")
    }
    toast.success("Baseline deleted", { id: "delete-baseline-toast" })
    return res.json()
  } catch (e: any) {
    toast.error(e.message || "Failed to delete baseline", { id: "delete-baseline-toast" })
    throw e
  }
}

export default function BaselinesTable({ baselines = [] as Baseline[] }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Baseline | null>(null)
  const [name, setName] = useState("")
  const [variable, setVariable] = useState("")
  const [minVersion, setMinVersion] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [variableStatus, setVariableStatus] = useState<'idle'|'checking'|'ok'|'exists'|null>(null)
  const variableTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedValue = useRef<string>("")
  const router = useRouter()

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return baselines.filter((b) => {
      if (!s) return true
      return (
        b.name.toLowerCase().includes(s) ||
        b.variable.toLowerCase().includes(s) ||
        b.minVersion.toLowerCase().includes(s)
      )
    })
  }, [q, baselines])

  const openCreate = () => {
    setEditItem(null)
    setName("")
    setVariable("")
    setMinVersion("")
    setOpen(true)
  }

  const openEdit = (b: Baseline) => {
    setEditItem(b)
    setName(b.name)
    setVariable(b.variable)
    setMinVersion(b.minVersion)
    setOpen(true)
  }

  const checkVariable = (value: string) => {
    if (variableTimeout.current) clearTimeout(variableTimeout.current)
    setVariableStatus('checking')
    variableTimeout.current = setTimeout(async () => {
      // Nur prüfen, wenn sich der Wert seit dem letzten Check geändert hat
      if (lastCheckedValue.current === value) return
      lastCheckedValue.current = value
      try {
        const res = await fetch(`/api/baselines?variable=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.exists) setVariableStatus('exists')
          else setVariableStatus('ok')
        } else {
          setVariableStatus(null)
        }
      } catch {
        setVariableStatus(null)
      }
    }, 500)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        if (editItem) {
          await apiUpdateBaseline({ id: editItem.id, name, variable, minVersion })
          toast.success("Baseline updated", { id: "create-baseline-toast" })
        } else {
          await apiCreateBaseline({ name, variable, minVersion })
          toast.success("Baseline created", { id: "create-baseline-toast" })
        }
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message)
        toast.error(err.message, { id: "create-baseline-toast" })
      }
    })
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">Baselines</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-60" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add baseline
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Variable</TableHead>
              <TableHead>Min version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.variable}</TableCell>
                <TableCell>{b.minVersion}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(b)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await apiDeleteBaseline(b.id)
                      router.refresh()
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit baseline" : "Add baseline"}</DialogTitle>
            <DialogDescription>
              Define a minimum version for a variable.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="bname">Name</Label>
              <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bvar">Variable</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bvar"
                  value={variable}
                  onChange={e => {
                    setVariable(e.target.value)
                    if (e.target.value) checkVariable(e.target.value)
                    else setVariableStatus(null)
                  }}
                  required
                  className="flex-1"
                />
                {variableStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {variableStatus === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {variableStatus === 'exists' && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bmin">Min version</Label>
              <Input id="bmin" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : null}
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
            {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
