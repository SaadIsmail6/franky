import React from 'react'
import { AnimeGrid } from '../components/AnimeGrid'
import type { AnimeResult } from '../types'

interface RecommendationsViewProps {
  items: AnimeResult[]
  onViewDetails?: (url: string) => void
  onShare?: (item: AnimeResult) => void
  onMoreLikeThis?: (item: AnimeResult) => void
}

export function RecommendationsView({ items, onViewDetails, onShare, onMoreLikeThis }: RecommendationsViewProps) {
  return (
    <section>
      <h2 style={{ padding: '16px 16px 0', margin: 0, color: '#f8f0ff' }}>Recommendations</h2>
      <AnimeGrid
        items={items}
        onViewDetails={onViewDetails}
        onShare={onShare}
        onMoreLikeThis={onMoreLikeThis}
      />
    </section>
  )
}
