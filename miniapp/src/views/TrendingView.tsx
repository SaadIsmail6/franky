import React from 'react'
import { AnimeGrid } from '../components/AnimeGrid'
import type { AnimeResult } from '../types'

interface TrendingViewProps {
  items: AnimeResult[]
  onViewDetails?: (url: string) => void
  onShare?: (item: AnimeResult) => void
}

export function TrendingView({ items, onViewDetails, onShare }: TrendingViewProps) {
  return (
    <section>
      <h2 style={{ padding: '16px 16px 0', margin: 0, color: '#f8f0ff' }}>Trending</h2>
      <AnimeGrid items={items} onViewDetails={onViewDetails} onShare={onShare} />
    </section>
  )
}
