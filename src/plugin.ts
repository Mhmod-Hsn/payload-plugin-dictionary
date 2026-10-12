import type { Config } from 'payload'

import type { DictionaryPluginConfig } from './types.js'

import { createTranslationsCollection } from './collections/Translations.js'
import { dictionaryEndpointHandler } from './endpoints/dictionaryEndpoint.js'

/**
 * Payload CMS v3 plugin that moves static frontend translation keys into the
 * database. Provides a `Translations` collection with namespaced, localized
 * key-value pairs and a REST endpoint for cache-friendly dictionary access.
 *
 * @example
 * ```ts
 * // payload.config.ts
 * import { dictionaryPlugin } from 'payload-plugin-dictionary'
 *
 * export default buildConfig({
 *   plugins: [
 *     dictionaryPlugin({
 *       namespaces: ['common', 'auth', 'marketing'],
 *       defaultNamespace: 'common',
 *     }),
 *   ],
 * })
 * ```
 */
export const dictionaryPlugin =
  (pluginConfig: DictionaryPluginConfig) =>
  (config: Config): Config => {
    if (!pluginConfig.namespaces || pluginConfig.namespaces.length === 0) {
      throw new Error(
        '[payload-dictionary-plugin] You must provide at least one namespace.',
      )
    }

    // ── Inject the Translations collection ──────────────────────────────────
    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(createTranslationsCollection(pluginConfig))

    // If the plugin is disabled, keep the collection schema registered for
    // migration consistency but skip runtime features.
    if (pluginConfig.disabled) {
      return config
    }

    // ── Inject the dictionary REST endpoint ─────────────────────────────────
    if (!config.endpoints) {
      config.endpoints = []
    }

    config.endpoints.push({
      handler: dictionaryEndpointHandler,
      method: 'get',
      path: '/dictionary/:namespace',
    })

    return config
  }
