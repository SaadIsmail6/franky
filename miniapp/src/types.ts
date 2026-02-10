/**
 * Miniapp shared types (mirrors backend AnimeResult for UI).
 */

export interface AnimeResult {
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
