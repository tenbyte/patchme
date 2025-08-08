"use client"

import { useMemo, useState, useTransition } from "react"
import type { User } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, Wand2 } from 'lucide-react'
import { createUser, deleteUser, updateUser } from "@/app/server-actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function generatePassword(length = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+[]{}"
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => chars[n % chars.length]).join("")
}

export default function UsersTable({ users = [] as User[] }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return users.filter((u) => {
      if (!s) return true
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s)
    })
  }, [q, users])

  const openCreate = () => {
    setEditItem(null)
    setName("")
    setEmail("")
    setPassword("")
    setRole("user")
    setOpen(true)
  }

  const openEdit = (u: User) => {
    setEditItem(u)
    setName(u.name)
    setEmail(u.email)
    setPassword("")
    setRole(u.role)
    setOpen(true)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (editItem) {
        await updateUser({
          id: editItem.id,
          name,
          email,
          password: password.trim() ? password : undefined,
          role,
        })
      } else {
        await createUser({ name, email, password, role })
      }
      setOpen(false)
    })
  }

  const onGenerate = () => {
    const pwd = generatePassword()
    setPassword(pwd)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">User accounts</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-60" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add user
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(u)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <form className="inline" action={deleteUser.bind(null, u.id)}>
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
            <DialogTitle>{editItem ? "Edit user" : "Add user"}</DialogTitle>
            <DialogDescription>Create and manage user accounts for PatchMe.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="uname">Name</Label>
              <Input id="uname" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="uemail">Email</Label>
              <Input id="uemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v: "admin" | "user") => setRole(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="upass">{editItem ? "Password (leave empty to keep)" : "Password"}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="upass"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editItem ? "••••••••" : ""}
                  required={!editItem}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={onGenerate} title="Generate password">
                  <Wand2 className="w-4 h-4 mr-1" />
                  Generate
                </Button>
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
