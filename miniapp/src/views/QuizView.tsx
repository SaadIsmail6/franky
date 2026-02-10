import React from 'react'

interface QuizViewProps {
  question: string
  options: string[]
  onSelect?: (index: number) => void
}

export function QuizView({ question, options, onSelect }: QuizViewProps) {
  return (
    <section style={{ padding: 16, color: '#f8f0ff' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Quiz</h2>
      <p style={{ marginBottom: 16 }}>{question}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              style={{
                display: 'block',
                width: '100%',
                marginBottom: 8,
                padding: 12,
                background: 'rgba(123, 44, 191, 0.3)',
                border: '1px solid rgba(0, 180, 216, 0.5)',
                borderRadius: 8,
                color: '#f8f0ff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {i + 1}. {opt}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
