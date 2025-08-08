import Dashboard from "@/components/dashboard"
import { getSystems, getSystemStatusCounts } from "@/lib/system"
import { getBaselines } from "@/lib/baseline"
import { getTags } from "@/lib/tags"
import { getActivityLogs } from "@/lib/activitylog"

export const dynamic = "force-dynamic"

export default async function Page() {
  const systems = await getSystems()
  const baselines = await getBaselines()
  const activity = await getActivityLogs()
  const tags = await getTags()
  const counts = await getSystemStatusCounts()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Dashboard
        systems={systems}
        baselines={baselines}
        activity={activity}
        tags={tags}
        counts={counts}
      />
    </main>
  )
}
