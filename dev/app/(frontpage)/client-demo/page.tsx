import { getDictionary, getTranslations } from 'payload-plugin-dictionary/cache'
import { DictionaryProvider } from 'payload-plugin-dictionary/client'

import { ClientCounter } from './ClientCounter.js'

export default async function ClientDemoPage() {
  // 1. In Server Components, you can get a callable t directly:
  const tServer = await getTranslations('common', 'en')

  // 2. Or fetch the raw dictionary object to pass to the client provider:
  const dictionary = await getDictionary('common', 'en')

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Standalone Client Component Demo</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
              h1 { font-size: 2rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .subtitle { color: #94a3b8; margin-bottom: 2rem; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
              pre { background: #0b1120; padding: 1rem; border-radius: 6px; overflow-x: auto; color: #e2e8f0; font-family: monospace; font-size: 0.85rem; margin-top: 0.5rem; }
              a { color: #38bdf8; text-decoration: none; }
              a:hover { color: #818cf8; }
            `,
          }}
        />
      </head>
      <body>
        <h1>⚛️ Standalone Client Component Demo</h1>
        <p className="subtitle">
          Demonstrating zero-dependency translations with callable <code>t(...)</code> functions on
          both Server and Client.
        </p>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            1. Server Component (`getTranslations`):
          </h2>
          <p style={{ color: '#94a3b8' }}>
            Direct call in RSC: <code>tServer(&apos;home.title&apos;)</code> &rarr;{' '}
            <strong style={{ color: '#38bdf8' }}>{tServer('home.title')}</strong>
          </p>
          <pre>{JSON.stringify(dictionary, null, 2)}</pre>
        </div>

        {/* 2. Wrap client components with DictionaryProvider */}
        <DictionaryProvider dictionary={dictionary}>
          <ClientCounter />
        </DictionaryProvider>

        <div style={{ marginTop: '2rem' }}>
          <a href="/page">← Back to Full Dictionary Overview</a>
        </div>
      </body>
    </html>
  )
}
