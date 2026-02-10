/**
 * Franky v2 – shared domain types.
 * AnimeResult is the canonical schema for all tool outputs; image fields are required.
 */

export type AnimeResult = {
  id: string
  title: string
  synopsis: string
  genres: string[]
  year?: number
  episodes?: number
  rating?: number
  coverImageUrl: string
  bannerImageUrl?: string
  reason: string
  externalUrl: string
}

export const PLACEHOLDER_COVER_URL = 'https://via.placeholder.com/300x420/1a0a2e/7b2cbf?text=Anime'
export const PLACEHOLDER_BANNER_URL = 'https://via.placeholder.com/920x300/1a0a2e/7b2cbf?text=Anime'
