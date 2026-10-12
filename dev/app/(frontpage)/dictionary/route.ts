import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Example Next.js route that fetches all translations for a namespace directly
 * from the Payload Local API — demonstrates the plugin's collection working
 * end-to-end without relying on getDictionary (which needs unstable_cache).
 *
 * Usage:
 *   GET /dictionary?namespace=common&locale=en
 *   GET /dictionary?namespace=auth&locale=ar
 *   GET /dictionary               → defaults to common/en
 */
export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const namespace = url.searchParams.get('namespace') || 'common'
  const locale = url.searchParams.get('locale') || 'en'

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'translations',
    depth: 0,
    locale: locale as any,
    pagination: false,
    where: {
      namespace: { equals: namespace },
    },
  })

  // Transform to flat key-value object.
  const dictionary: Record<string, string> = {}
  for (const doc of docs) {
    dictionary[doc.key] = doc.value ?? ''
  }

  return Response.json({
    count: Object.keys(dictionary).length,
    dictionary,
    locale,
    namespace,
  })
}
