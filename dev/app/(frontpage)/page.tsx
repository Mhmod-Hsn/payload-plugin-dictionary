import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { createTranslator } from 'payload-plugin-dictionary'

/**
 * Example React Server Component page that renders translations
 * for all three namespaces (common, auth, marketing) side by side
 * across all configured locales.
 *
 * Visit: http://localhost:3000/page
 */
export default async function DictionaryDemoPage() {
  const payload = await getPayload({ config: configPromise })

  const locales = ['en', 'ar', 'fr'] as const
  const namespaces = ['common', 'auth', 'marketing'] as const

  // Fetch all translations for each namespace × locale combination.
  const data: Record<string, Record<string, Record<string, string>>> = {}

  for (const ns of namespaces) {
    data[ns] = {}
    for (const locale of locales) {
      const { docs } = await payload.find({
        collection: 'translations',
        depth: 0,
        locale,
        pagination: false,
        where: { namespace: { equals: ns } },
      })

      const dict: Record<string, string> = {}
      for (const doc of docs) {
        dict[doc.key] = doc.value ?? ''
      }
      data[ns][locale] = dict
    }
  }

  // Create translators to demonstrate dynamic variable interpolation
  const tCommon = {
    ar: createTranslator(data.common?.ar || {}),
    en: createTranslator(data.common?.en || {}),
    fr: createTranslator(data.common?.fr || {}),
  }

  const tMarketing = {
    ar: createTranslator(data.marketing?.ar || {}),
    en: createTranslator(data.marketing?.en || {}),
    fr: createTranslator(data.marketing?.fr || {}),
  }

  const tAuth = {
    ar: createTranslator(data.auth?.ar || {}),
    en: createTranslator(data.auth?.en || {}),
    fr: createTranslator(data.auth?.fr || {}),
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Dictionary Plugin Demo</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
              h1 { font-size: 2rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .subtitle { color: #94a3b8; margin-bottom: 2rem; }
              .namespace-section { margin-bottom: 2.5rem; }
              .namespace-title { font-size: 1.25rem; color: #38bdf8; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
              .namespace-title::before { content: ''; display: inline-block; width: 4px; height: 1.25rem; background: #38bdf8; border-radius: 2px; }
              table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
              th { background: #334155; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #cbd5e1; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
              td { padding: 0.75rem 1rem; border-top: 1px solid #334155; font-size: 0.9rem; }
              tr:hover td { background: #293548; }
              .key-cell { color: #fbbf24; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.85rem; }
              .locale-en { color: #e2e8f0; }
              .locale-ar { color: #a5b4fc; direction: rtl; text-align: right; }
              .locale-fr { color: #86efac; }
              .stats { display: flex; gap: 1rem; margin-bottom: 2rem; }
              .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1rem 1.5rem; flex: 1; }
              .stat-value { font-size: 1.75rem; font-weight: 700; color: #38bdf8; }
              .stat-label { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
              .api-links { margin-top: 2rem; padding: 1.5rem; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
              .api-links h2 { font-size: 1.1rem; color: #e2e8f0; margin-bottom: 1rem; }
              .api-link { display: block; color: #38bdf8; text-decoration: none; font-family: monospace; font-size: 0.9rem; padding: 0.5rem 0; border-bottom: 1px solid #334155; }
              .api-link:last-child { border-bottom: none; }
              .api-link:hover { color: #818cf8; }
              .api-link span { color: #94a3b8; font-family: system-ui; margin-left: 1rem; }
              .variables-card { background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 1.5rem; margin-bottom: 2.5rem; }
              .variables-title { font-size: 1.25rem; color: #a78bfa; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
              .variables-title::before { content: ''; display: inline-block; width: 4px; height: 1.25rem; background: #a78bfa; border-radius: 2px; }
              .variables-desc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.25rem; }
              .var-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; }
              .var-item { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
              .var-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
              .var-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.82rem; background: #1e293b; color: #38bdf8; padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid #334155; word-break: break-all; }
              .var-raw { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.82rem; color: #fbbf24; }
              .var-results { margin-top: 0.25rem; padding-top: 0.5rem; border-top: 1px solid #1e293b; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.88rem; }
              .var-row { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
              .var-locale-badge { font-size: 0.75rem; font-weight: 700; color: #64748b; width: 24px; text-transform: uppercase; }
            `,
          }}
        />
      </head>
      <body>
        <h1>📖 Dictionary Plugin Demo</h1>
        <p className="subtitle">
          All translations below are fetched from the Payload database via the plugin&apos;s
          Translations collection.
        </p>

        <div className="stats">
          {namespaces.map((ns) => (
            <div className="stat-card" key={ns}>
              <div className="stat-value">{Object.keys(data[ns].en).length}</div>
              <div className="stat-label">{ns} keys</div>
            </div>
          ))}
          <div className="stat-card">
            <div className="stat-value">{locales.length}</div>
            <div className="stat-label">locales</div>
          </div>
        </div>

        {/* Dynamic Variables / Interpolation Demo */}
        <div className="variables-card">
          <h2 className="variables-title">✨ Variable Interpolation Example</h2>
          <p className="variables-desc">
            Translations support <code>&#123;variable&#125;</code> placeholders. Pass values to{' '}
            <code>t(key, &#123; ...params &#125;)</code> and they are dynamically replaced on
            both Server and Client:
          </p>

          <div className="var-grid">
            <div className="var-item">
              <span className="var-label">1. String Variable (`&#123;name&#125;`)</span>
              <div className="var-code">t(&apos;greeting.user&apos;, &#123; name: &apos;Sarah&apos; &#125;)</div>
              <div className="var-raw">
                DB Template: {data.common?.en?.['greeting.user'] || 'Welcome back, {name}!'}
              </div>
              <div className="var-results">
                <div className="var-row">
                  <span className="var-locale-badge">en</span>
                  <span className="locale-en">
                    {tCommon.en('greeting.user', { name: 'Sarah' }, 'Welcome back, Sarah!')}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">ar</span>
                  <span className="locale-ar">
                    {tCommon.ar('greeting.user', { name: 'سارة' }, 'مرحبًا بعودتك، سارة!')}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">fr</span>
                  <span className="locale-fr">
                    {tCommon.fr('greeting.user', { name: 'Sarah' }, 'Ravi de vous revoir, Sarah !')}
                  </span>
                </div>
              </div>
            </div>

            <div className="var-item">
              <span className="var-label">2. Numeric Count Variable (`&#123;count&#125;`)</span>
              <div className="var-code">t(&apos;cart.items&apos;, &#123; count: 3 &#125;)</div>
              <div className="var-raw">
                DB Template: {data.common?.en?.['cart.items'] || 'You have {count} items in your cart'}
              </div>
              <div className="var-results">
                <div className="var-row">
                  <span className="var-locale-badge">en</span>
                  <span className="locale-en">
                    {tCommon.en('cart.items', { count: 3 }, 'You have 3 items in your cart')}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">ar</span>
                  <span className="locale-ar">
                    {tCommon.ar('cart.items', { count: 3 }, 'لديك 3 عناصر في عربة التسوق')}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">fr</span>
                  <span className="locale-fr">
                    {tCommon.fr('cart.items', { count: 3 }, 'Vous avez 3 articles dans votre panier')}
                  </span>
                </div>
              </div>
            </div>

            <div className="var-item">
              <span className="var-label">3. Multiple Variables (`&#123;code&#125;`, `&#123;discount&#125;`)</span>
              <div className="var-code">
                t(&apos;promo.discount&apos;, &#123; code: &apos;SAVE20&apos;, discount: 20 &#125;)
              </div>
              <div className="var-raw">
                DB Template:{' '}
                {data.marketing?.en?.['promo.discount'] ||
                  'Use code {code} for {discount}% off!'}
              </div>
              <div className="var-results">
                <div className="var-row">
                  <span className="var-locale-badge">en</span>
                  <span className="locale-en">
                    {tMarketing.en(
                      'promo.discount',
                      { code: 'SAVE20', discount: 20 },
                      'Use code SAVE20 for 20% off!',
                    )}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">ar</span>
                  <span className="locale-ar">
                    {tMarketing.ar(
                      'promo.discount',
                      { code: 'SAVE20', discount: 20 },
                      'استخدم الرمز SAVE20 للحصول على خصم 20%!',
                    )}
                  </span>
                </div>
                <div className="var-row">
                  <span className="var-locale-badge">fr</span>
                  <span className="locale-fr">
                    {tMarketing.fr(
                      'promo.discount',
                      { code: 'SAVE20', discount: 20 },
                      'Utilisez le code SAVE20 pour obtenir 20 % de réduction !',
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {namespaces.map((ns) => {
          const keys = Object.keys(data[ns].en).sort()
          return (
            <div className="namespace-section" key={ns}>
              <h2 className="namespace-title">{ns}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>English</th>
                    <th>العربية (Arabic)</th>
                    <th>Français (French)</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key}>
                      <td className="key-cell">{key}</td>
                      <td className="locale-en">{data[ns].en[key]}</td>
                      <td className="locale-ar">{data[ns].ar[key]}</td>
                      <td className="locale-fr">{data[ns].fr[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        <div className="api-links">
          <h2>🔗 Try the API Endpoints</h2>
          <a className="api-link" href="/api/dictionary/common?locale=en">
            GET /api/dictionary/common?locale=en
            <span>— Plugin REST endpoint (common, English)</span>
          </a>
          <a className="api-link" href="/api/dictionary/auth?locale=ar">
            GET /api/dictionary/auth?locale=ar
            <span>— Plugin REST endpoint (auth, Arabic)</span>
          </a>
          <a className="api-link" href="/api/dictionary/marketing?locale=fr">
            GET /api/dictionary/marketing?locale=fr
            <span>— Plugin REST endpoint (marketing, French)</span>
          </a>
          <a className="api-link" href="/dictionary?namespace=common&locale=en">
            GET /dictionary?namespace=common&locale=en
            <span>— Example route using Local API</span>
          </a>
          <a className="api-link" href="/namespaces">
            GET /namespaces
            <span>— List all namespaces with key counts</span>
          </a>
          <a className="api-link" href="/search?q=button">
            GET /search?q=button
            <span>— Search translations by key/value</span>
          </a>
          <a className="api-link" href="/client-demo">
            PAGE /client-demo
            <span>— Standalone Client Components demo (DictionaryProvider + useTranslations)</span>
          </a>
        </div>
      </body>
    </html>
  )
}
