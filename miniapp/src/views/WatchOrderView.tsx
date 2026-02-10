import React from 'react'

interface Step {
  order: number
  title: string
  description?: string
}

interface WatchOrderViewProps {
  seriesName: string
  steps: Step[]
}

export function WatchOrderView({ seriesName, steps }: WatchOrderViewProps) {
  return (
    <section style={{ padding: 16, color: '#f8f0ff' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Watch order: {seriesName}</h2>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {steps.map((s) => (
          <li key={s.order} style={{ marginBottom: 8 }}>
            <strong>{s.title}</strong>
            {s.description && <span style={{ color: 'rgba(248,240,255,0.8)' }}> — {s.description}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
