import React from 'react'
import { AnimeGrid } from '../components/AnimeGrid'
import type { AnimeResult } from '../types'

interface SeasonalViewProps {
  items: AnimeResult[]
  onViewDetails?: (url: string) => void
  onShare?: (item: AnimeResult) => void
}

export function SeasonalView({ items, onViewDetails, onShare }: SeasonalViewProps) {
  return (
    <section>
      <h2 style={{ padding: '16px 16px 0', margin: 0, color: '#f8f0ff' }}>This Season</h2>
      <AnimeGrid items={items} onViewDetails={onViewDetails} onShare={onShare} />
    </section>
  )
}
