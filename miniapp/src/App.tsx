import React from 'react'
import { MainScreen } from './components/MainScreen'
import { DebugPanel } from './components/DebugPanel'
import { neon } from './theme/neon'

const isDev = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true'

export function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: neon.bg.dark,
        color: neon.text.primary,
      }}
    >
      <MainScreen />
      {isDev && <div style={{ padding: 16 }}><DebugPanel /></div>}
    </div>
  )
}
