import React, { useState, useCallback } from 'react'
import { neon } from '../theme/neon'
import { getDisplayName } from '../sdk'
import { CATEGORY_CHIPS, searchAnime, getRecommendationsByMood, getSimilarAnime } from '../api/anime'
import type { AnimeItem } from '../api/anime'
import { RecommendationCard } from './RecommendationCard'

export function MainScreen() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AnimeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = getDisplayName()

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const lower = q.toLowerCase()
      if (lower.match(/like|similar|like\s+.+/)) {
        const title = q.replace(/something like|like|similar to|anime like/gi, '').trim() || q
        const items = await getSimilarAnime(title, 8)
        setResults(items)
      } else {
        const items = await searchAnime(q, 10)
        setResults(items)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChip = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        if (id === 'short') {
          const items = await searchAnime('short anime 12 episodes', 8)
          setResults(items)
        } else {
          const items = await getRecommendationsByMood(id, 10)
          setResults(items)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed')
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: neon.bg.gradient,
        color: neon.text.primary,
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: 20,
          padding: '12px 0',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            background: neon.gradient.purple,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: neon.shadow.neon,
          }}
        >
          Franky
        </h1>
        <p style={{ margin: '8px 0 0 0', color: neon.text.muted, fontSize: 14 }}>
          Yo {displayName} — ready for your next anime?
        </p>
      </header>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Ask Franky about anime…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 16px',
            fontSize: 16,
            borderRadius: 12,
            border: neon.border.cyan,
            background: neon.bg.elevated,
            color: neon.text.primary,
            outline: 'none',
            boxShadow: neon.border.glow,
          }}
        />
        <button
          type="button"
          onClick={() => runSearch(query)}
          style={{
            marginTop: 10,
            width: '100%',
            padding: 12,
            fontSize: 14,
            fontWeight: 600,
            background: neon.gradient.cyan,
            border: 'none',
            borderRadius: 10,
            color: neon.bg.dark,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: neon.text.muted, marginBottom: 8 }}>Categories</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChip(chip.id)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                borderRadius: 20,
                border: neon.border.glass,
                background: neon.bg.card,
                color: neon.text.primary,
                cursor: 'pointer',
                transition: neon.transition,
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      {loading && (
        <p style={{ color: neon.text.muted, fontSize: 14, textAlign: 'center', padding: 24 }}>
          Loading…
        </p>
      )}

      {!loading && results.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: neon.text.secondary }}>
            Recommendations
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            {results.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {!loading && results.length === 0 && !error && query === '' && (
        <p style={{ color: neon.text.muted, fontSize: 14, textAlign: 'center', padding: 24 }}>
          Search or pick a category to get started.
        </p>
      )}
    </div>
  )
}
