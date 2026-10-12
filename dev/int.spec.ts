import type { Payload } from 'payload'

import config from '@payload-config'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload

afterAll(async () => {
  if (payload) {
    await payload.destroy()
  }
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Dictionary Plugin — Translations Collection', () => {
  // ── CRUD ──────────────────────────────────────────────────────────────────

  test('should create a translation with namespace, key, and value', async () => {
    const doc = await payload.create({
      collection: 'translations',
      data: {
        key: 'test.greeting',
        namespace: 'common',
        value: 'Hello World',
      },
      locale: 'en',
    })

    expect(doc.namespace).toBe('common')
    expect(doc.key).toBe('test.greeting')
    expect(doc.value).toBe('Hello World')
  })

  test('should read back the created translation', async () => {
    const { docs } = await payload.find({
      collection: 'translations',
      locale: 'en',
      where: {
        key: { equals: 'test.greeting' },
      },
    })

    expect(docs).toHaveLength(1)
    expect(docs[0].value).toBe('Hello World')
  })

  test('should update a translation value', async () => {
    const { docs } = await payload.find({
      collection: 'translations',
      where: { key: { equals: 'test.greeting' } },
    })

    const updated = await payload.update({
      id: docs[0].id,
      collection: 'translations',
      data: { value: 'Hello Updated' },
      locale: 'en',
    })

    expect(updated.value).toBe('Hello Updated')
  })

  test('should delete a translation', async () => {
    const { docs } = await payload.find({
      collection: 'translations',
      where: { key: { equals: 'test.greeting' } },
    })

    await payload.delete({
      id: docs[0].id,
      collection: 'translations',
    })

    const { totalDocs } = await payload.count({
      collection: 'translations',
      where: { key: { equals: 'test.greeting' } },
    })

    expect(totalDocs).toBe(0)
  })

  // ── Localization ──────────────────────────────────────────────────────────

  test('should store and retrieve localized values', async () => {
    const doc = await payload.create({
      collection: 'translations',
      data: {
        key: 'test.localized',
        namespace: 'auth',
        value: 'Login',
      },
      locale: 'en',
    })

    // Set Arabic value.
    await payload.update({
      id: doc.id,
      collection: 'translations',
      data: { value: 'تسجيل الدخول' },
      locale: 'ar',
    })

    // Set French value.
    await payload.update({
      id: doc.id,
      collection: 'translations',
      data: { value: 'Connexion' },
      locale: 'fr',
    })

    // Read back each locale.
    const en = await payload.findByID({
      id: doc.id,
      collection: 'translations',
      locale: 'en',
    })
    expect(en.value).toBe('Login')

    const ar = await payload.findByID({
      id: doc.id,
      collection: 'translations',
      locale: 'ar',
    })
    expect(ar.value).toBe('تسجيل الدخول')

    const fr = await payload.findByID({
      id: doc.id,
      collection: 'translations',
      locale: 'fr',
    })
    expect(fr.value).toBe('Connexion')

    // Cleanup.
    await payload.delete({ id: doc.id, collection: 'translations' })
  })

  // ── Validation: no spaces in key ──────────────────────────────────────────

  test('should reject keys containing spaces', async () => {
    await expect(
      payload.create({
        collection: 'translations',
        data: {
          key: 'invalid key with spaces',
          namespace: 'common',
          value: 'Should fail',
        },
      }),
    ).rejects.toThrow()
  })

  // ── Validation: duplicate namespace + key ─────────────────────────────────

  test('should reject duplicate namespace + key combination', async () => {
    // Create the first entry.
    const doc = await payload.create({
      collection: 'translations',
      data: {
        key: 'test.duplicate_check',
        namespace: 'common',
        value: 'First',
      },
    })

    // Attempt to create a duplicate.
    await expect(
      payload.create({
        collection: 'translations',
        data: {
          key: 'test.duplicate_check',
          namespace: 'common',
          value: 'Second',
        },
      }),
    ).rejects.toThrow()

    // Cleanup.
    await payload.delete({ id: doc.id, collection: 'translations' })
  })

  // ── Namespace filtering ───────────────────────────────────────────────────

  test('should filter translations by namespace', async () => {
    // Create entries in two different namespaces.
    const doc1 = await payload.create({
      collection: 'translations',
      data: { key: 'test.ns_filter_a', namespace: 'common', value: 'A' },
    })
    const doc2 = await payload.create({
      collection: 'translations',
      data: { key: 'test.ns_filter_b', namespace: 'auth', value: 'B' },
    })

    const { docs: commonDocs } = await payload.find({
      collection: 'translations',
      pagination: false,
      where: { namespace: { equals: 'common' } },
    })

    const commonKeys = commonDocs.map((d) => d.key)
    expect(commonKeys).toContain('test.ns_filter_a')
    expect(commonKeys).not.toContain('test.ns_filter_b')

    // Cleanup.
    await payload.delete({ id: doc1.id, collection: 'translations' })
    await payload.delete({ id: doc2.id, collection: 'translations' })
  })

  // ── Flat dictionary shape ─────────────────────────────────────────────────

  test('should produce a flat key:value dictionary when reduced', async () => {
    const doc1 = await payload.create({
      collection: 'translations',
      data: { key: 'test.dict_a', namespace: 'marketing', value: 'Value A' },
    })
    const doc2 = await payload.create({
      collection: 'translations',
      data: { key: 'test.dict_b', namespace: 'marketing', value: 'Value B' },
    })

    const { docs } = await payload.find({
      collection: 'translations',
      depth: 0,
      pagination: false,
      where: { namespace: { equals: 'marketing' } },
    })

    // Reduce to flat object — same transform used by getDictionary and the endpoint.
    const dictionary = docs.reduce<Record<string, string>>((acc, doc) => {
      acc[doc.key] = doc.value ?? ''
      return acc
    }, {})

    expect(dictionary['test.dict_a']).toBe('Value A')
    expect(dictionary['test.dict_b']).toBe('Value B')

    // Cleanup.
    await payload.delete({ id: doc1.id, collection: 'translations' })
    await payload.delete({ id: doc2.id, collection: 'translations' })
  })
})

describe('Dictionary Plugin — REST Endpoint', () => {
  test('should respond to GET /api/dictionary/:namespace', async () => {
    // Seed a translation for this test.
    const doc = await payload.create({
      collection: 'translations',
      data: {
        key: 'test.endpoint_check',
        namespace: 'common',
        value: 'Endpoint Works',
      },
      locale: 'en',
    })

    // Hit the endpoint through Payload's REST API handler.
    const response = await fetch(
      `${payload.config.serverURL || 'http://localhost:3000'}/api/dictionary/common?locale=en`,
    ).catch(() => null)

    // In test mode we may not have a running server, so test the handler directly.
    if (!response) {
      // Import and invoke the handler manually.
      const { dictionaryEndpointHandler } = await import('../src/endpoints/dictionaryEndpoint.js')
      const { createPayloadRequest } = await import('payload')

      const request = new Request('http://localhost:3000/api/dictionary/common?locale=en', {
        method: 'GET',
      })
      const payloadRequest = await createPayloadRequest({ config, request })
      const res = await dictionaryEndpointHandler(payloadRequest)

      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data['test.endpoint_check']).toBe('Endpoint Works')
    }

    // Cleanup.
    await payload.delete({ id: doc.id, collection: 'translations' })
  })
})

describe('Dictionary Plugin — Collection Registration', () => {
  test('translations collection should be registered', () => {
    expect(payload.collections['translations']).toBeDefined()
  })

  test('translations collection should have the expected fields', () => {
    const collection = payload.config.collections.find((c) => c.slug === 'translations')

    expect(collection).toBeDefined()

    const fieldNames = collection!.fields
      .filter((f) => 'name' in f)
      .map((f) => ('name' in f ? f.name : ''))

    expect(fieldNames).toContain('namespace')
    expect(fieldNames).toContain('key')
    expect(fieldNames).toContain('value')
  })
})

describe('Dictionary Plugin — Translator & Client Components', () => {
  test('createTranslator provides callable lookup, fallback, and interpolation', async () => {
    const { createTranslator } = await import('../src/utilities/createTranslator.js')

    const t = createTranslator({
      'button.submit': 'Submit Form',
      'welcome.user': 'Welcome, {name}!',
    })

    expect(typeof t).toBe('function')
    expect(t('button.submit')).toBe('Submit Form')
    expect(t('welcome.user', { name: 'Alice' })).toBe('Welcome, Alice!')
    expect(t('missing.key', 'Fallback Label')).toBe('Fallback Label')
    expect(t('missing.key')).toBe('missing.key')
    expect(t.has('button.submit')).toBe(true)
    expect(t.has('missing.key')).toBe(false)
    expect(t.raw('button.submit')).toBe('Submit Form')
    expect(t.dictionary).toEqual({
      'button.submit': 'Submit Form',
      'welcome.user': 'Welcome, {name}!',
    })
  })

  test('useDictionary / useTranslations provides callable t function via Context', async () => {
    const { createElement } = await import('react')
    const { renderToString } = await import('react-dom/server')
    const { DictionaryProvider, useDictionary, useTranslations } =
      await import('../src/client/index.js')

    let capturedT: any

    function Consumer() {
      const t = useTranslations()
      capturedT = t
      return createElement(
        'div',
        null,
        createElement('span', { id: 'greeting' }, t('greeting', { name: 'World' })),
        createElement('span', { id: 'fallback' }, t('not.found', 'Default Value')),
      )
    }

    const html = renderToString(
      createElement(
        DictionaryProvider,
        { dictionary: { greeting: 'Hello, {name}!' } },
        createElement(Consumer),
      ),
    )

    expect(html).toContain('Hello, World!')
    expect(html).toContain('Default Value')
    expect(typeof capturedT).toBe('function')
    expect(capturedT('greeting', { name: 'World' })).toBe('Hello, World!')
  })
})
