"use client"

import { useMemo, useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Tag } from "@/lib/types"
import toast from "react-hot-toast"


async function apiCreateTag({ name }: { name: string }) {
  const res = await fetch("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const data = await res.json()
    toast.error(data.error || "Failed to create tag", { id: "create-tag-toast" })
    throw new Error(data.error || "Failed to create tag")
  }
  return res.json()
}

async function apiUpdateTag({ id, name }: { id: string; name: string }) {
  const res = await fetch(`/api/tags?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to update tag")
  return res.json()
}

async function apiDeleteTag(id: string) {
  const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete tag")
  return res.json()
}

export default function TagsTable({ tags = [] as Tag[] }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Tag | null>(null)
  const [name, setName] = useState("")
  const [tagStatus, setTagStatus] = useState<'idle'|'checking'|'ok'|'exists'|null>(null)
  const tagTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedTag = useRef<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return tags.filter((t) => (!s ? true : t.name.toLowerCase().includes(s)))
  }, [q, tags])

  const openCreate = () => {
    setEditItem(null)
    setName("")
    setOpen(true)
  }

  const openEdit = (t: Tag) => {
    setEditItem(t)
    setName(t.name)
    setOpen(true)
  }

  const checkTag = (value: string) => {
    if (tagTimeout.current) clearTimeout(tagTimeout.current)
    setTagStatus('checking')
    tagTimeout.current = setTimeout(async () => {
      if (lastCheckedTag.current === value) return
      lastCheckedTag.current = value
      try {
        const res = await fetch(`/api/tags?name=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.exists) setTagStatus('exists')
          else setTagStatus('ok')
        } else {
          setTagStatus(null)
        }
      } catch {
        setTagStatus(null)
      }
    }, 500)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (editItem) {
          await apiUpdateTag({ id: editItem.id, name })
        } else {
          await apiCreateTag({ name })
        }
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        // Fehler wird bereits im Toast angezeigt
      }
    })
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">Tags</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-60" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add tag
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(t)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await apiDeleteTag(t.id)
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
            <DialogTitle>{editItem ? "Edit tag" : "Add tag"}</DialogTitle>
            <DialogDescription>Manage global tags.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="tname">Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tname"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (e.target.value) checkTag(e.target.value)
                    else setTagStatus(null)
                  }}
                  required
                  className="flex-1"
                />
                {tagStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {tagStatus === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {tagStatus === 'exists' && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
