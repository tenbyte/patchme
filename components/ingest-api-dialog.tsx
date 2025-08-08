"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command } from 'lucide-react'
import type { System, SystemVarValue } from "@/lib/store"

function exampleForVar(value: SystemVarValue | undefined, key: string) {
  if (Array.isArray(value)) {
    const ex = value.length ? value : ["example 1", "example 2"]
    return { name: key, values: ex }
  }
  const ex = typeof value === "string" && value ? value : "1.0.0"
  return { name: key, value: ex }
}

export default function IngestApiDialog({
  system,
  trigger,
  baseUrl = "https://your-app.example",
}: {
  system: System
  trigger: React.ReactNode
  baseUrl?: string
}) {
  const entries = system.allowedVariables.map((k) => exampleForVar(system.variables[k], k))

  const schema = `POST /api/ingest
  Content-Type: application/json

  {
    "key": "pm_XXXXXXX",
    "entries": [
${entries
  .map((e) =>
    "values" in e
      ? `      {"name": "${e.name}", "values": ${JSON.stringify(e.values)}}`
      : `      {"name": "${e.name}", "value": "${e.value}"}`
  )
  .join(",\n")}
    ]
  }

  Response:
  { "ok": true }`

  const curlBody = { key: system.apiKey, entries }
  const curl = `curl -X POST ${baseUrl}/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlBody, null, 2)}'`

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-4 h-4" /> Ingest API
            <span className="ml-auto text-xs text-muted-foreground">{system.name}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>
          <TabsContent value="schema" className="mt-3">
            <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">
              {schema}
            </div>
          </TabsContent>
          <TabsContent value="curl" className="mt-3">
            <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">
              {curl}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
