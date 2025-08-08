"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { System } from "@/lib/store"
import { VariableMultiSelect } from "./variable-multiselect"
import { getGlobalVars, getTagNames } from "@/lib/store"
import { updateSystem } from "@/app/server-actions"

export default function SystemEditDialog({
  system,
  trigger,
}: {
  system: System
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(system.name)
  const [hostname, setHostname] = useState(system.hostname)
  const [globals, setGlobals] = useState<string[]>(system.allowedVariables)
  const [tags, setTags] = useState<string[]>(system.tags)
  const [options, setOptions] = useState<string[]>([])
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([getGlobalVars(), getTagNames()]).then(([g, t]) => {
      setOptions(g.map((x) => x.name))
      setTagOptions(t)
    })
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await updateSystem({
        id: system.id,
        name,
        hostname,
        tags,
        allowedVariables: globals,
      })
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit system</DialogTitle>
          <DialogDescription>Edit the basics, tags, and allowed global variables.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hostname">Hostname / URL</Label>
              <Input id="hostname" required value={hostname} onChange={(e) => setHostname(e.target.value)} />
            </div>
          </div>

          <VariableMultiSelect
            options={tagOptions}
            value={tags}
            onChange={setTags}
            placeholder="Select tags…"
            label="Tags"
            creatable={false}
          />

          <VariableMultiSelect
            options={options}
            value={globals}
            onChange={setGlobals}
            creatable={false}
            placeholder="Select global variables…"
            label="Global variables"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
