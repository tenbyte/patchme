import TopBar from "@/components/topbar"
import TagsTable from "@/components/tags-table"
import { getTags } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function TagsPage() {
  const tags = await getTags()
  return (
    <main className="min-h-screen bg-background">
      <TopBar userName="Admin" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <TagsTable tags={tags} />
      </div>
    </main>
  )
}
