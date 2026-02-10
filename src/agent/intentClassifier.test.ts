/**
 * Unit tests for intent classifier.
 */

import { describe, expect, test } from 'bun:test'
import { classifyIntent } from './intentClassifier'
import { Intent } from './types'

describe('classifyIntent', () => {
  test('ANIME_RECOMMEND for "what should I watch"', () => {
    const r = classifyIntent('what should I watch')
    expect(r.intent).toBe(Intent.ANIME_RECOMMEND)
    expect(r.confidence).toBeGreaterThan(0)
  })

  test('ANIME_RECOMMEND for "something like attack on titan"', () => {
    const r = classifyIntent('something like attack on titan')
    expect(r.intent).toBe(Intent.ANIME_RECOMMEND)
    expect(r.detectedTitle).toBeDefined()
    expect(r.detectedTitle).toContain('attack')
  })

  test('CHARACTER_INFO for "who is gojo"', () => {
    const r = classifyIntent('who is gojo')
    expect(r.intent).toBe(Intent.CHARACTER_INFO)
    expect(r.detectedCharacter).toBeDefined()
  })

  test('WATCH_ORDER for "watch order for fate"', () => {
    const r = classifyIntent('watch order for fate')
    expect(r.intent).toBe(Intent.WATCH_ORDER)
  })

  test('TRENDING for "what\'s trending this season"', () => {
    const r = classifyIntent("what's trending this season")
    expect(r.intent).toBe(Intent.TRENDING)
  })

  test('SEASONAL for "this season anime"', () => {
    const r = classifyIntent('this season anime')
    expect(r.intent).toBe(Intent.SEASONAL)
  })

  test('QUIZ for "quiz me"', () => {
    const r = classifyIntent('quiz me')
    expect(r.intent).toBe(Intent.QUIZ)
  })

  test('TRIVIA for "tell me a fact"', () => {
    const r = classifyIntent('tell me a fact')
    expect(r.intent).toBe(Intent.TRIVIA)
  })

  test('RANKING for "top anime"', () => {
    const r = classifyIntent('top anime')
    expect(r.intent).toBe(Intent.RANKING)
  })

  test('empty string yields UNKNOWN or GENERAL_ANIME_CHAT', () => {
    const r = classifyIntent('')
    expect([Intent.UNKNOWN, Intent.GENERAL_ANIME_CHAT]).toContain(r.intent)
    expect(r.confidence).toBeLessThanOrEqual(0.5)
  })

  test('extracts genres from query', () => {
    const r = classifyIntent('recommend me a dark action anime')
    expect(r.intent).toBe(Intent.ANIME_RECOMMEND)
    expect(r.genres).toBeDefined()
    expect(Array.isArray(r.genres)).toBe(true)
  })
})
