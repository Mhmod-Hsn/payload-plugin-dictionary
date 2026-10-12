import config from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'

import type { DictionaryResult } from '../types.js'
import type { TranslationParams, Translator } from '../utilities/createTranslator.js'

import { createTranslator } from '../utilities/createTranslator.js'

export type { DictionaryResult, TranslationParams, Translator }


/**
 * Fetches all translation key-value pairs for a given `namespace` and `locale`
 * from the Payload database, wrapped in Next.js `unstable_cache` and tagged
 * with `'payload-translations'` for on-demand revalidation.
 *
 * @example
 * ```tsx
 * // In a React Server Component
 * const dict = await getDictionary('common', 'en')
 * // dict => { "button.submit": "Submit", "footer.copyright": "© 2026" }
 * ```
 */
export const getDictionary = async (
  namespace: string,
  locale: string = 'en',
): Promise<DictionaryResult> => {
  const fetchFromDB = unstable_cache(
    async (): Promise<DictionaryResult> => {
      const payload = await getPayload({ config })

      const { docs } = await payload.find({
        collection: 'translations',
        depth: 0,
        locale,
        pagination: false,
        where: {
          namespace: { equals: namespace },
        },
      })

      return docs.reduce<DictionaryResult>((acc, doc) => {
        const key = doc.key as string
        const value = doc.value as string
        acc[key] = value ?? ''
        return acc
      }, {})
    },
    [`dictionary-${namespace}-${locale}`],
    {
      tags: ['payload-translations'],
    },
  )

  return fetchFromDB()
}

/**
 * Fetches translations and returns a callable `t(key, params?, fallback?)`
 * function for React Server Components.
 *
 * @example
 * ```tsx
 * // In a React Server Component
 * const t = await getTranslations('common', 'en')
 * const label = t('button.submit')
 * const welcome = t('welcome.user', { name: 'John' })
 * ```
 */
export const getTranslations = async (
  namespace: string,
  locale: string = 'en',
): Promise<Translator> => {
  const dictionary = await getDictionary(namespace, locale)
  return createTranslator(dictionary)
}
