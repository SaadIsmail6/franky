import React from 'react'
import ReactDOM from 'react-dom/client'
import { initSdk, sdkReady } from './sdk'
import { App } from './App'

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  // Must call ready() after UI loads or splash screen will hang (Farcaster Mini App SDK).
  initSdk().then(() => sdkReady())
}
