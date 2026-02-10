import React from 'react'
import type { AnimeResult } from '../types'
import { neon } from '../theme/neon'

interface AnimeCardProps {
  item: AnimeResult
  onViewDetails?: (url: string) => void
  onShare?: (item: AnimeResult) => void
  onMoreLikeThis?: (item: AnimeResult) => void
}

const placeholderCover = 'https://via.placeholder.com/300x420/1a0a2e/7b2cbf?text=Anime'

export function AnimeCard({ item, onViewDetails, onShare, onMoreLikeThis }: AnimeCardProps) {
  const cover = item.coverImageUrl || placeholderCover

  return (
    <article
      className="anime-card"
      style={{
        background: neon.bg.card,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(0, 180, 216, 0.3)',
        boxShadow: neon.border.glow,
        transition: neon.transition,
      }}
    >
      <div
        className="poster-wrap"
        style={{
          position: 'relative',
          paddingTop: '140%',
          background: `url(${cover}) center/cover`,
          backgroundColor: neon.bg.dark,
        }}
      >
        <div
          className="gradient-overlay"
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
      <div style={{ padding: 10 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginBottom: 8,
            fontSize: 11,
            color: neon.text.muted,
          }}
        >
          {item.genres?.slice(0, 3).map((g) => (
            <span key={g} style={{ background: 'rgba(123,44,191,0.3)', padding: '2px 6px', borderRadius: 4 }}>
              {g}
            </span>
          ))}
        </div>
        {item.reason && (
          <p style={{ fontSize: 12, color: neon.text.secondary, margin: '0 0 10px 0', lineHeight: 1.4 }}>
            {item.reason}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(item.externalUrl)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                background: neon.gradient.cyan,
                border: 'none',
                borderRadius: 6,
                color: neon.bg.dark,
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(item)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                background: 'transparent',
                border: neon.border.cyan,
                borderRadius: 6,
                color: neon.text.primary,
                cursor: 'pointer',
              }}
            >
              Share
            </button>
          )}
          {onMoreLikeThis && (
            <button
              type="button"
              onClick={() => onMoreLikeThis(item)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                background: 'transparent',
                border: '1px solid rgba(123, 44, 191, 0.6)',
                borderRadius: 6,
                color: neon.text.primary,
                cursor: 'pointer',
              }}
            >
              More Like This
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
