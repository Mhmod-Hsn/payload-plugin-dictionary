import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Example: Search translations by a partial key or value match.
 *
 * GET /search?q=button
 * GET /search?q=login&locale=ar
 */
export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const locale = url.searchParams.get('locale') || 'en'

  if (!query) {
    return Response.json({ error: 'Missing "q" search parameter.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'translations',
    depth: 0,
    locale,
    pagination: false,
    where: {
      or: [{ key: { contains: query } }, { value: { contains: query } }],
    },
  })

  return Response.json({
    count: docs.length,
    locale,
    query,
    results: docs.map((doc) => ({
      key: doc.key,
      namespace: doc.namespace,
      value: doc.value,
    })),
  })
}
