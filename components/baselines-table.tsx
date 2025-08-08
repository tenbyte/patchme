"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
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

async function apiCreateBaseline({ name, variable, minVersion }: { name: string; variable: string; minVersion: string }) {
  const res = await fetch("/api/baselines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variable, minVersion }),
  })
  if (!res.ok) throw new Error("Failed to create baseline")
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

async function apiDeleteBaseline(id: string) {
  const res = await fetch(`/api/baselines?id=${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete baseline")
  return res.json()
}

export default function BaselinesTable({ baselines = [] as Baseline[] }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Baseline | null>(null)
  const [name, setName] = useState("")
  const [variable, setVariable] = useState("")
  const [minVersion, setMinVersion] = useState("")
  const [isPending, startTransition] = useTransition()
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (editItem) {
        await apiUpdateBaseline({ id: editItem.id, name, variable, minVersion })
      } else {
        await apiCreateBaseline({ name, variable, minVersion })
      }
      setOpen(false)
      router.refresh()
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
              <Input id="bvar" value={variable} onChange={(e) => setVariable(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bmin">Min version</Label>
              <Input id="bmin" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
