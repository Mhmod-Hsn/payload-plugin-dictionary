import type { CollectionConfig } from 'payload'

import { revalidateTag } from 'next/cache.js'

import type { DictionaryPluginConfig } from '../types.js'

/**
 * Creates the `translations` collection definition driven by the plugin config.
 */
export const createTranslationsCollection = (
  pluginConfig: DictionaryPluginConfig,
): CollectionConfig => {
  const namespaceOptions = pluginConfig.namespaces.map((ns) => ({
    label: ns,
    value: ns,
  }))

  return {
    slug: 'translations',
    admin: {
      defaultColumns: ['namespace', 'key', 'value'],
      description: 'Manage frontend UI translation strings.',
      group: 'Dictionary',
      useAsTitle: 'key',
    },
    fields: [
      {
        name: 'namespace',
        type: 'select',
        admin: {
          description: 'The logical group this translation belongs to.',
        },
        defaultValue: pluginConfig.defaultNamespace ?? pluginConfig.namespaces[0],
        options: namespaceOptions,
        required: true,
      },
      {
        name: 'key',
        type: 'text',
        admin: {
          description: 'A dot-separated identifier, e.g. "auth.login_button". No spaces allowed.',
        },
        required: true,
        unique: true,
        validate: (value: null | string | undefined) => {
          if (!value) {
            return 'Key is required.'
          }
          if (/\s/.test(value)) {
            return 'Key must not contain spaces. Use dots or underscores instead.'
          }
          return true
        },
      },
      {
        name: 'value',
        type: 'textarea',
        admin: {
          description: 'The translated string for this key.',
        },
        localized: true,
        required: true,
      },
    ],
    hooks: {
      afterChange: [
        () => {
          try {
            revalidateTag('payload-translations', 'max')
          } catch {
            // revalidateTag may throw outside a Next.js request context (e.g. CLI / tests).
          }
        },
      ],
      afterDelete: [
        () => {
          try {
            revalidateTag('payload-translations', 'max')
          } catch {
            // Same guard as afterChange.
          }
        },
      ],
      beforeValidate: [
        async ({ data, operation, req }) => {
          if (!data?.namespace || !data?.key) {
            return data
          }

          // Ensure namespace + key uniqueness across the collection.
          const existing = await req.payload.find({
            collection: 'translations',
            depth: 0,
            limit: 1,
            where: {
              and: [
                { namespace: { equals: data.namespace } },
                { key: { equals: data.key } },
                // Exclude the current document during updates.
                ...(operation === 'update' && data.id ? [{ id: { not_equals: data.id } }] : []),
              ],
            },
          })

          if (existing.totalDocs > 0) {
            throw new Error(
              `A translation with namespace "${data.namespace}" and key "${data.key}" already exists.`,
            )
          }

          return data
        },
      ],
    },
    labels: {
      plural: 'Translations',
      singular: 'Translation',
    },
  }
}
