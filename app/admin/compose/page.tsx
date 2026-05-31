import { getContentItem, saveContent } from './actions'
import { ComposeForm } from './compose-form'

export const dynamic = 'force-dynamic'

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  let item = null

  if (params.id) {
    try {
      item = await getContentItem(params.id)
    } catch {
      item = null
    }
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#fafafa',
          marginBottom: '0.25rem',
        }}
      >
        {item ? 'Edit Article' : 'New Article'}
      </h1>
      <p
        style={{
          color: '#a3a3a3',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}
      >
        {item ? `Editing "${item.title}"` : 'Compose something worth remembering'}
      </p>

      <ComposeForm item={item} saveAction={saveContent} />
    </div>
  )
}
