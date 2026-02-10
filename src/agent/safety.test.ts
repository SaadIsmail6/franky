/**
 * Unit tests for safety module.
 */

import { describe, expect, test } from 'bun:test'
import { isOffTopic, containsExplicitRequest, containsPiracyRequest, getRedirectMessage, filterResponseText } from './safety'

describe('safety', () => {
  test('isOffTopic detects crypto', () => {
    expect(isOffTopic('what about bitcoin price')).toBe(true)
    expect(isOffTopic('recommend me an anime')).toBe(false)
  })

  test('containsExplicitRequest', () => {
    expect(containsExplicitRequest('recommend anime')).toBe(false)
    expect(containsExplicitRequest('only nsfw only')).toBe(true)
  })

  test('containsPiracyRequest', () => {
    expect(containsPiracyRequest('where to watch one piece')).toBe(false)
    expect(containsPiracyRequest('free stream attack on titan')).toBe(true)
  })

  test('getRedirectMessage returns anime-focused text', () => {
    const msg = getRedirectMessage()
    expect(msg).toContain('anime')
    expect(msg).toContain('recommendations')
  })

  test('filterResponseText strips piracy-like URLs', () => {
    const text = 'Check out https://evil.com/stream/pirate for more'
    const out = filterResponseText(text)
    expect(out).toContain('[link removed]')
  })
})
