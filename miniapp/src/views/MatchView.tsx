import React from 'react'

interface MatchViewProps {
  characterName: string
  animeTitle: string
  description: string
  confidence: number
}

export function MatchView({ characterName, animeTitle, description, confidence }: MatchViewProps) {
  return (
    <section style={{ padding: 16, color: '#f8f0ff' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Character Match</h2>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{characterName}</p>
      <p style={{ color: 'rgba(248,240,255,0.8)', marginBottom: 4 }}>{animeTitle}</p>
      <p style={{ fontSize: 14, marginBottom: 8 }}>{description}</p>
      <p style={{ fontSize: 12, color: 'rgba(248,240,255,0.5)' }}>{Math.round(confidence * 100)}% match</p>
    </section>
  )
}
