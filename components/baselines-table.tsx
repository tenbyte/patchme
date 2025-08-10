"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useRouter } from "next/navigation"
import type { Baseline } from "@/lib/types"
import toast from "react-hot-toast"
import CreateBaselineDialog from "@/components/create-baseline-dialog"

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
  const [editBaseline, setEditBaseline] = useState<Baseline | null>(null)
  const router = useRouter()

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return baselines.filter((b) => {
      if (!s) return true
      return (
        b.name.toLowerCase().includes(s) ||
        b.variable.toLowerCase().includes(s) ||
        b.minVersion.toLowerCase().includes(s) ||
        (b.type && b.type.toLowerCase().includes(s))
      )
    })
  }, [q, baselines])

  const openCreate = () => {
    setEditBaseline(null)
    setOpen(true)
  }

  const openEdit = (baseline: Baseline) => {
    setEditBaseline(baseline)
    setOpen(true)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-lg font-semibold">Baselines</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-60" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={openCreate} className="w-full sm:w-auto">
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
              <TableHead>Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.variable}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    (b.type || 'MIN') === 'MIN' ? 'bg-blue-100 text-blue-800' :
                    (b.type || 'MIN') === 'MAX' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {b.type || 'MIN'}
                  </span>
                </TableCell>
                <TableCell>{b.minVersion}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-end sm:gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateBaselineDialog 
        open={open} 
        onOpenChange={setOpen} 
        editBaseline={editBaseline}
      />
    </Card>
  )
}
