"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function VariableMultiSelect({
  options = [],
  value = [],
  onChange = () => {},
  onCreateOption,
  placeholder = "Select…",
  label = "Options",
  creatable = true,
}: {
  options?: string[]
  value?: string[]
  onChange?: (next: string[]) => void
  onCreateOption?: (name: string) => void
  placeholder?: string
  label?: string
  creatable?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, input])

  const toggle = (key: string) => {
    const set = new Set(value)
    if (set.has(key)) set.delete(key)
    else set.add(key)
    onChange(Array.from(set))
  }

  const canCreate = React.useMemo(() => {
    const name = input.trim()
    if (!creatable) return false
    if (!name) return false
    return !options.includes(name)
  }, [creatable, input, options])

  const create = () => {
    const name = input.trim()
    if (!name) return
    onCreateOption?.(name)
    if (!options.includes(name)) {
      onChange(Array.from(new Set([...value, name])))
    }
    setInput("")
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={creatable ? "Search or create…" : "Search…"}
              value={input}
              onValueChange={setInput}
            />
            <CommandList>
              <CommandEmpty>No results found</CommandEmpty>
              {/* Removed heading to avoid showing any label like "Options" */}
              <CommandGroup>
                {filtered.map((opt) => {
                  const selected = value.includes(opt)
                  return (
                    <CommandItem key={opt} value={opt} onSelect={() => toggle(opt)}>
                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                      {opt}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {creatable && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={create} disabled={!canCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      {input.trim() ? `Add “${input.trim()}”` : "Add new"}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs"
            >
              {k}
              <button
                type="button"
                aria-label={`Remove ${k}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => toggle(k)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
