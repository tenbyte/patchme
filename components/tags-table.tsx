"use client"

import { useMemo, useState, useTransition } from "react"
import type { Tag } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { createTag, deleteTag, updateTag } from "@/app/server-actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function TagsTable({ tags = [] as Tag[] }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Tag | null>(null)
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (editItem) {
        await updateTag({ id: editItem.id, name })
      } else {
        await createTag({ name })
      }
      setOpen(false)
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
                  <form className="inline" action={deleteTag.bind(null, t.id)}>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </form>
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
              <Input id="tname" value={name} onChange={(e) => setName(e.target.value)} required />
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
