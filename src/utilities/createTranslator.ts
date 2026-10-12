export type TranslationParams = Record<string, number | string>

export interface Translator {
  /**
   * Looks up a translation key with optional interpolation variables and fallback.
   *
   * @example
   * t('button.submit') // "Submit"
   * t('greeting', { name: 'Sarah' }) // "Hello Sarah"
   * t('missing.key', {}, 'Default fallback') // "Default fallback"
   */
  (
    key: string,
    params?: string | TranslationParams,
    fallback?: string,
  ): string

  /**
   * The underlying raw dictionary object.
   */
  dictionary: Record<string, string>

  /**
   * Checks if a key exists in the dictionary.
   */
  has: (key: string) => boolean

  /**
   * Returns the raw translation value without interpolation or fallback.
   */
  raw: (key: string) => string | undefined
}

/**
 * Creates a callable `t` translation function from a flat dictionary object.
 */
export function createTranslator(dictionary: Record<string, string> = {}): Translator {
  const t = (
    key: string,
    paramsOrFallback?: string | TranslationParams,
    fallback?: string,
  ): string => {
    const rawValue = dictionary[key]

    if (rawValue === undefined) {
      if (typeof paramsOrFallback === 'string') {
        return paramsOrFallback
      }
      if (typeof fallback === 'string') {
        return fallback
      }
      return key
    }

    if (paramsOrFallback && typeof paramsOrFallback === 'object') {
      let interpolated = rawValue
      for (const [k, v] of Object.entries(paramsOrFallback)) {
        interpolated = interpolated.replaceAll(`{${k}}`, String(v))
      }
      return interpolated
    }

    return rawValue
  }

  t.dictionary = dictionary
  t.has = (key: string) => key in dictionary
  t.raw = (key: string) => dictionary[key]

  return t
}
