import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Example: Lists all available namespaces and how many keys each has.
 *
 * GET /namespaces
 */
export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'translations',
    depth: 0,
    pagination: false,
  })

  // Group by namespace.
  const namespaceCounts: Record<string, number> = {}
  for (const doc of docs) {
    const ns = doc.namespace as string
    namespaceCounts[ns] = (namespaceCounts[ns] || 0) + 1
  }

  return Response.json({
    namespaces: Object.entries(namespaceCounts).map(([name, count]) => ({
      name,
      keyCount: count,
    })),
    totalTranslations: docs.length,
  })
}
