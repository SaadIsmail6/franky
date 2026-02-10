import React from 'react'

interface TriviaViewProps {
  text: string
}

export function TriviaView({ text }: TriviaViewProps) {
  return (
    <section style={{ padding: 16, color: '#f8f0ff' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Trivia</h2>
      <p style={{ lineHeight: 1.5 }}>{text}</p>
    </section>
  )
}
