'use client'

import { useDictionary, useTranslations } from 'payload-plugin-dictionary/client'
import { useState } from 'react'

export function ClientCounter() {
  // Can use either useDictionary() or useTranslations()
  const t = useTranslations()
  const [count, setCount] = useState(0)

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        marginTop: '1.5rem',
        padding: '1.5rem',
      }}
    >
      <h3 style={{ color: '#38bdf8', marginBottom: '0.75rem' }}>
        Interactive Client Component (`t(&apos;key&apos;)`)
      </h3>
      <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
        This component is marked with <code>&apos;use client&apos;</code> and calls the <code>t(...)</code> function directly:
      </p>

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}
      >
        <div>
          <strong style={{ color: '#fbbf24' }}>t(&apos;button.submit&apos;):</strong>{' '}
          <span>{t('button.submit')}</span>
        </div>
        <div>
          <strong style={{ color: '#fbbf24' }}>t(&apos;button.cancel&apos;):</strong>{' '}
          <span>{t('button.cancel')}</span>
        </div>
        <div>
          <strong style={{ color: '#fbbf24' }}>t(&apos;home.title&apos;):</strong>{' '}
          <span>{t('home.title')}</span>
        </div>
        <div>
          <strong style={{ color: '#a78bfa' }}>t(&apos;non.existent&apos;, &apos;Custom Fallback&apos;):</strong>{' '}
          <span>{t('non.existent', 'Custom Fallback')}</span>
        </div>
      </div>

      <div style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          style={{
            background: '#38bdf8',
            border: 'none',
            borderRadius: '6px',
            color: '#0f172a',
            cursor: 'pointer',
            fontWeight: 600,
            padding: '0.5rem 1rem',
          }}
        >
          {t('button.submit')} ({count})
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            background: '#334155',
            border: 'none',
            borderRadius: '6px',
            color: '#e2e8f0',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
          }}
        >
          {t('button.cancel')}
        </button>
      </div>
    </div>
  )
}
