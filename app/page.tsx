import Dashboard from "@/components/dashboard"
import { getActivity, getBaselines, getSystems, getSystemStatusCounts, getTagNames } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function Page() {
  const systems = await getSystems()
  const baselines = await getBaselines()
  const activity = await getActivity()
  const tags = await getTagNames()
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
