import React from 'react'
import { AnimeCard } from './AnimeCard'
import type { AnimeResult } from '../types'

interface AnimeGridProps {
  items: AnimeResult[]
  onViewDetails?: (url: string) => void
  onShare?: (item: AnimeResult) => void
  onMoreLikeThis?: (item: AnimeResult) => void
}

export function AnimeGrid({ items, onViewDetails, onShare, onMoreLikeThis }: AnimeGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
        padding: 16,
      }}
    >
      {items.map((item) => (
        <AnimeCard
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}
          onShare={onShare}
          onMoreLikeThis={onMoreLikeThis}
        />
      ))}
    </div>
  )
}
