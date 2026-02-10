import React, { useState } from 'react'
import { RecommendationsView } from './views/RecommendationsView'
import { TrendingView } from './views/TrendingView'
import { SeasonalView } from './views/SeasonalView'
import { QuizView } from './views/QuizView'
import { MatchView } from './views/MatchView'
import { WatchOrderView } from './views/WatchOrderView'
import { TriviaView } from './views/TriviaView'
import type { AnimeResult } from './types'
import { neon } from './theme/neon'

type ViewState =
  | { view: 'recommendations'; items: AnimeResult[] }
  | { view: 'trending'; items: AnimeResult[] }
  | { view: 'seasonal'; items: AnimeResult[] }
  | { view: 'quiz'; question: string; options: string[]; correctIndex: number }
  | { view: 'match'; characterName: string; animeTitle: string; description: string; confidence: number }
  | { view: 'watchOrder'; seriesName: string; steps: { order: number; title: string; description?: string }[] }
  | { view: 'trivia'; text: string }
  | null

export function App() {
  const [state, setState] = useState<ViewState>(null)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: neon.bg.dark,
        color: neon.text.primary,
      }}
    >
      {!state && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px 0', background: neon.gradient.purple, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Franky
          </h1>
          <p style={{ color: neon.text.muted }}>AnimeTown — ask in chat for recommendations, trending, or quiz.</p>
        </div>
      )}
      {state?.view === 'recommendations' && (
        <RecommendationsView
          items={state.items}
          onViewDetails={(url) => window.open?.(url, '_blank')}
          onMoreLikeThis={() => setState(null)}
        />
      )}
      {state?.view === 'trending' && (
        <TrendingView
          items={state.items}
          onViewDetails={(url) => window.open?.(url, '_blank')}
        />
      )}
      {state?.view === 'seasonal' && (
        <SeasonalView
          items={state.items}
          onViewDetails={(url) => window.open?.(url, '_blank')}
        />
      )}
      {state?.view === 'quiz' && (
        <QuizView
          question={state.question}
          options={state.options}
          onSelect={() => setState(null)}
        />
      )}
      {state?.view === 'match' && (
        <MatchView
          characterName={state.characterName}
          animeTitle={state.animeTitle}
          description={state.description}
          confidence={state.confidence}
        />
      )}
      {state?.view === 'watchOrder' && (
        <WatchOrderView seriesName={state.seriesName} steps={state.steps} />
      )}
      {state?.view === 'trivia' && <TriviaView text={state.text} />}
    </div>
  )
}
