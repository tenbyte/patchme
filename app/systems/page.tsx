import SystemsTable from "@/components/systems-table"
import { getSystems } from "@/lib/system"

export const dynamic = "force-dynamic"

export default async function SystemsPage() {
  const systemsRaw = await getSystems()
  // lastSeen zu string, tags und baselines zu richtigen Typen mappen
  const systems = systemsRaw.map((s) => ({
    ...s,
    lastSeen: s.lastSeen ? s.lastSeen.toString() : null,
    tags: s.tags,
    baselines: s.baselines,
  }))
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SystemsTable systems={systems} />
      </div>
    </main>
  )
}