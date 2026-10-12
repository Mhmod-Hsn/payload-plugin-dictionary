import type { PayloadHandler } from 'payload'

/**
 * Custom Payload REST endpoint handler for `/api/dictionary/:namespace`.
 *
 * Query params:
 *   - `locale` (string, defaults to `'en'`)
 *
 * Returns the dictionary as a flat JSON object with aggressive cache headers.
 */
export const dictionaryEndpointHandler: PayloadHandler = async (req) => {
  const url = new URL(req.url || '', `http://${req.headers.get('host') || 'localhost'}`)
  const pathParts = url.pathname.split('/')
  // The namespace is the last path segment: /api/dictionary/:namespace
  const namespace = pathParts[pathParts.length - 1] || ''
  const locale = url.searchParams.get('locale') || 'en'

  if (!namespace) {
    return Response.json({ error: 'Missing namespace parameter.' }, { status: 400 })
  }

  const { docs } = await req.payload.find({
    collection: 'translations',
    depth: 0,
    locale,
    pagination: false,
    where: {
      namespace: { equals: namespace },
    },
  })

  const dictionary: Record<string, string> = {}
  for (const doc of docs) {
    const key = doc.key as string
    const value = doc.value as string
    dictionary[key] = value ?? ''
  }

  return new Response(JSON.stringify(dictionary), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
    status: 200,
  })
}
