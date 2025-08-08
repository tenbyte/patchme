"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSystem } from "@/app/server-actions"
import { getGlobalVars, getTagNames } from "@/lib/store"
import { VariableMultiSelect } from "./variable-multiselect"

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateSystemDialog({ open = false, onOpenChange = () => {} }: Props) {
  const [name, setName] = useState("")
  const [hostname, setHostname] = useState("")
  const [selectedGlobals, setSelectedGlobals] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const [globalOptions, setGlobalOptions] = useState<string[]>([])
  const [tagOptions, setTagOptions] = useState<string[]>([])

  useEffect(() => {
    Promise.all([getGlobalVars(), getTagNames()]).then(([globals, tagNames]) => {
      setGlobalOptions(globals.map((g) => g.name))
      setTagOptions(tagNames)
    })
  }, [])

  const canSubmit = useMemo(() => {
    if (!name || !hostname) return false
    if (selectedGlobals.length === 0) return false
    return true
  }, [name, hostname, selectedGlobals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createSystem({
        name,
        hostname,
        tags: selectedTags,
        selectedGlobalVars: selectedGlobals,
      })
      onOpenChange(false)
      setName("")
      setHostname("")
      setSelectedGlobals([])
      setSelectedTags([])
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create system</DialogTitle>
          <DialogDescription>An API key is generated automatically. Only selected global variables are accepted via ingest.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hostname">Hostname / URL</Label>
              <Input id="hostname" required value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="https://srv01.acme.com" />
            </div>
          </div>

          <VariableMultiSelect
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags…"
            label="Tags"
            creatable={false}
          />

          <VariableMultiSelect
            options={globalOptions}
            value={selectedGlobals}
            onChange={setSelectedGlobals}
            placeholder="Select global variables…"
            label="Global variables"
            creatable={false}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit || isPending}>{isPending ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
