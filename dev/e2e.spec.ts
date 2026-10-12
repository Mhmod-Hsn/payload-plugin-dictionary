import { expect, test } from '@playwright/test'

test.describe('Dictionary Plugin — Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin.
    await page.goto('/admin')
    await page.fill('#field-email', 'dev@payloadcms.com')
    await page.fill('#field-password', 'test')
    await page.click('.form-submit button')
    await expect(page).toHaveTitle(/Dashboard/)
  })

  test('should show Translations collection in the sidebar under Dictionary group', async ({
    page,
  }) => {
    // Look for the "Dictionary" group and "Translations" link in the nav.
    const nav = page.locator('nav')
    await expect(nav.getByText('Dictionary')).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Translations' })).toBeVisible()
  })

  test('should navigate to Translations list view', async ({ page }) => {
    await page.click('nav >> text=Translations')
    await expect(page).toHaveURL(/\/admin\/collections\/translations/)
  })

  test('should create a new translation from the admin panel', async ({ page }) => {
    await page.goto('/admin/collections/translations/create')

    // Fill in the namespace selector.
    await page.click('#field-namespace')
    await page.click('[data-value="common"]')

    // Fill in the key field.
    await page.fill('#field-key', 'e2e.test_key')

    // Fill in the value field.
    await page.fill('#field-value', 'E2E Test Value')

    // Save.
    await page.click('#action-save')

    // Should redirect to the created document.
    await expect(page.locator('.toast-success')).toBeVisible()
  })

  test('should show validation error for keys with spaces', async ({ page }) => {
    await page.goto('/admin/collections/translations/create')

    await page.click('#field-namespace')
    await page.click('[data-value="common"]')

    // Enter a key with spaces — should fail validation.
    await page.fill('#field-key', 'bad key with spaces')
    await page.fill('#field-value', 'Should fail')
    await page.click('#action-save')

    // The form should show an error and not navigate away.
    await expect(page.locator('.field-error')).toBeVisible()
  })
})

test.describe('Dictionary Plugin — REST Endpoint', () => {
  test('GET /api/dictionary/common should return JSON', async ({ request }) => {
    const response = await request.get('/api/dictionary/common?locale=en')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(typeof data).toBe('object')
    // The seeded translations should include keys from the "common" namespace.
    expect(data).toHaveProperty('button.submit')
    expect(data['button.submit']).toBe('Submit')
  })

  test('GET /api/dictionary/auth?locale=ar should return Arabic translations', async ({
    request,
  }) => {
    const response = await request.get('/api/dictionary/auth?locale=ar')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('login.title')
    expect(data['login.title']).toBe('تسجيل الدخول')
  })

  test('GET /api/dictionary/marketing?locale=fr should return French translations', async ({
    request,
  }) => {
    const response = await request.get('/api/dictionary/marketing?locale=fr')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('hero.title')
    expect(data['hero.title']).toContain('incroyable')
  })

  test('should have Cache-Control header', async ({ request }) => {
    const response = await request.get('/api/dictionary/common?locale=en')
    const cacheControl = response.headers()['cache-control']
    expect(cacheControl).toContain('s-maxage')
  })
})

test.describe('Dictionary Plugin — Example Pages', () => {
  test('should render the demo page with translations table', async ({ page }) => {
    await page.goto('/page')
    await expect(page.locator('h1')).toContainText('Dictionary Plugin Demo')
    // Should render tables for each namespace.
    await expect(page.locator('table')).toHaveCount(3)
  })

  test('GET /dictionary should return dictionary JSON', async ({ request }) => {
    const response = await request.get('/dictionary?namespace=common&locale=en')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.namespace).toBe('common')
    expect(data.locale).toBe('en')
    expect(data.count).toBeGreaterThan(0)
    expect(data.dictionary).toHaveProperty('button.submit')
  })

  test('GET /namespaces should list all namespaces', async ({ request }) => {
    const response = await request.get('/namespaces')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.totalTranslations).toBeGreaterThan(0)
    const nsNames = data.namespaces.map((ns: { name: string }) => ns.name)
    expect(nsNames).toContain('common')
    expect(nsNames).toContain('auth')
    expect(nsNames).toContain('marketing')
  })

  test('GET /search should find translations by query', async ({ request }) => {
    const response = await request.get('/search?q=button')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.count).toBeGreaterThan(0)
    expect(data.results[0].key).toContain('button')
  })
})
