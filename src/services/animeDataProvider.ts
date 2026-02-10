/**
 * Franky v2 – anime data provider (AniList-first, fallback-ready).
 * All tools use this; no direct external API calls from tools.
 */

import type { AnimeResult } from '../domain/types'

export interface AnimeDataProvider {
  searchByTitle(title: string, limit?: number): Promise<AnimeResult[]>
  getRecommendationsByTitle(title: string, limit?: number): Promise<AnimeResult[]>
  searchByFilters(filters: {
    genres?: string[]
    moods?: string[]
    episodeMax?: number
    episodeMin?: number
    limit?: number
  }): Promise<AnimeResult[]>
  fetchTrending(limit?: number): Promise<AnimeResult[]>
  fetchSeasonal(season?: string, year?: number, limit?: number): Promise<AnimeResult[]>
  fetchCharacter(name: string): Promise<{ name: string; role: string; traits: string[]; animeTitle: string; imageUrl?: string } | null>
  fetchSeriesGuide(seriesName: string): Promise<{ steps: { order: number; title: string; description?: string }[] } | null>
}

/** Stub: will be replaced by AniListAnimeDataProvider at startup */
class StubAnimeDataProvider implements AnimeDataProvider {
  async searchByTitle(): Promise<AnimeResult[]> {
    return []
  }
  async getRecommendationsByTitle(): Promise<AnimeResult[]> {
    return []
  }
  async searchByFilters(): Promise<AnimeResult[]> {
    return []
  }
  async fetchTrending(): Promise<AnimeResult[]> {
    return []
  }
  async fetchSeasonal(): Promise<AnimeResult[]> {
    return []
  }
  async fetchCharacter(): Promise<{ name: string; role: string; traits: string[]; animeTitle: string; imageUrl?: string } | null> {
    return null
  }
  async fetchSeriesGuide(): Promise<{ steps: { order: number; title: string; description?: string }[] } | null> {
    return null
  }
}

let defaultProvider: AnimeDataProvider = new StubAnimeDataProvider()

export function getAnimeDataProvider(): AnimeDataProvider {
  return defaultProvider
}

export function setAnimeDataProvider(provider: AnimeDataProvider): void {
  defaultProvider = provider
}
