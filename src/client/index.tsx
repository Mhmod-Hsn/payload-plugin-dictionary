'use client'

import React, { createContext, use, useMemo } from 'react'

import type { TranslationParams, Translator } from '../utilities/createTranslator.js'

import { createTranslator } from '../utilities/createTranslator.js'

export type { TranslationParams, Translator }
export type DictionaryContextValue = Record<string, string>

const DictionaryContext = createContext<DictionaryContextValue>({})

export interface DictionaryProviderProps {
  children?: React.ReactNode
  /**
   * The flat key-value dictionary object, typically fetched via `getDictionary()`
   * in a Server Component and passed down.
   */
  dictionary: DictionaryContextValue
}

/**
 * Provides a translation dictionary to all nested client components via React Context.
 *
 * @example
 * ```tsx
 * // layout.tsx (Server Component)
 * import { getDictionary } from 'payload-plugin-dictionary/cache'
 * import { DictionaryProvider } from 'payload-plugin-dictionary/client'
 *
 * export default async function Layout({ children }) {
 *   const dictionary = await getDictionary('common', 'en')
 *   return (
 *     <DictionaryProvider dictionary={dictionary}>
 *       {children}
 *     </DictionaryProvider>
 *   )
 * }
 * ```
 */
export function DictionaryProvider({ children, dictionary }: DictionaryProviderProps) {
  return (
    <DictionaryContext value={dictionary}>{children}</DictionaryContext>
  )
}

/**
 * Returns a callable `t` translation function from the nearest `DictionaryProvider`.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useDictionary } from 'payload-plugin-dictionary/client'
 *
 * export function SubmitButton() {
 *   const t = useDictionary()
 *   return <button>{t('button.submit')}</button>
 * }
 * ```
 */
export function useDictionary(): Translator {
  const context = use(DictionaryContext)

  if (process.env.NODE_ENV !== 'production' && Object.keys(context).length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[payload-dictionary-plugin] useDictionary() returned an empty object. ' +
        'Make sure a <DictionaryProvider> is rendered above this component.',
    )
  }

  return useMemo(() => createTranslator(context), [context])
}

/**
 * Alias for `useDictionary()`.
 */
export const useTranslations = useDictionary
