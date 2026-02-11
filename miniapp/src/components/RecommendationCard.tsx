import React from 'react'
import type { AnimeItem } from '../api/anime'
import { neon } from '../theme/neon'
import { openUrl, composeCast } from '../sdk'

export function RecommendationCard({ item }: { item: AnimeItem }) {
  const trailerUrl = item.externalUrl
  const handleView = () => openUrl(trailerUrl)
  const handleShare = () => composeCast({ text: `Check out ${item.title} — ${item.externalUrl}` })

  return (
    <article
      className="recommendation-card"
      style={{
        background: neon.bg.card,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 12,
        overflow: 'hidden',
        border: neon.border.glass,
        boxShadow: neon.shadow.card,
        transition: neon.transition,
      }}
    >
      <div
        style={{
          position: 'relative',
          paddingTop: '140%',
          background: `url(${item.coverImageUrl}) center/cover`,
          backgroundColor: neon.bg.dark,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(13,10,20,0.95) 0%, transparent 50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 12,
            color: neon.text.primary,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {item.title}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {item.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(0, 180, 216, 0.2)',
                border: neon.border.cyan,
                color: neon.text.secondary,
              }}
            >
              {g}
            </span>
          ))}
        </div>
        {item.synopsis && (
          <p
            style={{
              fontSize: 12,
              color: neon.text.muted,
              margin: '0 0 8px 0',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.synopsis}
          </p>
        )}
        {item.rating != null && (
          <p style={{ fontSize: 12, color: neon.text.secondary, margin: '0 0 10px 0' }}>
            ★ {(item.rating / 10).toFixed(1)}/10
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleView}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              background: neon.gradient.cyan,
              border: 'none',
              borderRadius: 8,
              color: neon.bg.dark,
              cursor: 'pointer',
              boxShadow: neon.border.glow,
            }}
          >
            View Trailer
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              background: 'transparent',
              border: neon.border.pink,
              borderRadius: 8,
              color: neon.text.primary,
              cursor: 'pointer',
            }}
          >
            Share
          </button>
        </div>
      </div>
    </article>
  )
}
