/**
 * Configuration options for the `payload-dictionary-plugin`.
 */
export interface DictionaryPluginConfig {
  /**
   * The default namespace to pre-select in the admin panel.
   * Must be one of the values in the `namespaces` array.
   * @default The first element in `namespaces`
   */
  defaultNamespace?: string

  /**
   * If `true`, the plugin's runtime features (endpoints, hooks, admin UI) are disabled,
   * but the collection schema is still registered to keep migrations consistent.
   * @default false
   */
  disabled?: boolean

  /**
   * An array of namespace strings used to categorize translation keys.
   * These will populate the `namespace` select field in the Translations collection.
   * @example ['common', 'auth', 'marketing']
   */
  namespaces: string[]
}

export type DictionaryResult = Record<string, string>

