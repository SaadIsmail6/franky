/**
 * AniList API integration for anime information
 */

/**
 * AniList API response types
 */
interface AniListTitle {
    romaji: string | null
    english: string | null
    native: string | null
}

interface AniListNextAiringEpisode {
    episode: number
    timeUntilAiring: number
}

interface AniListMedia {
    title: AniListTitle
    nextAiringEpisode: AniListNextAiringEpisode | null
    siteUrl: string
    status: string | null
    episodes: number | null
}

interface AniListResponse {
    data: {
        Media: AniListMedia | null
    }
}

interface AniListRecommendationMedia {
    title: {
        english: string | null
        romaji: string | null
    }
    episodes: number | null
    averageScore: number | null
    siteUrl: string
}

interface AniListRecommendationResponse {
    data: {
        Page: {
            media: AniListRecommendationMedia[]
        }
    }
}

/**
 * Return type for getAiringInfo function
 */
export interface AiringInfo {
    title: string // english || romaji || native
    nextEpisode: number | null
    timeUntilSeconds: number | null
    siteUrl: string
    status: string | null
    episodes: number | null
}

/**
 * Return type for getRecommendations function
 */
export interface Recommendation {
    title: string // english || romaji || native
    episodes: number | null
    score: number | null
    siteUrl: string
}

/**
 * GraphQL query for fetching anime airing information
 */
const ANILIST_QUERY = `
  query ($search: String) {
    Media (search: $search, type: ANIME) {
      title { romaji english native }
      nextAiringEpisode { episode timeUntilAiring }
      siteUrl
      status
      episodes
    }
  }
`

/**
 * Get airing information for an anime from AniList
 * 
 * @param title - The anime title to search for
 * @returns AiringInfo object with anime details, or null if not found
 * @throws Error if AniList API is unreachable
 */
export async function getAiringInfo(title: string): Promise<AiringInfo | null> {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: ANILIST_QUERY,
                variables: { search: title },
            }),
        })

        // Check if request was successful
        if (!response.ok) {
            throw new Error(`AniList API returned status ${response.status}: ${response.statusText}`)
        }

        const data: AniListResponse = await response.json()

        // Check if Media is missing
        if (!data.data?.Media) {
            return null
        }

        const media = data.data.Media

        // Determine title (prefer english, then romaji, then native)
        const mediaTitle =
            media.title.english || media.title.romaji || media.title.native || 'Unknown'

        // Extract next airing episode info
        const nextEpisode = media.nextAiringEpisode?.episode ?? null
        const timeUntilSeconds = media.nextAiringEpisode?.timeUntilAiring ?? null

        return {
            title: mediaTitle,
            nextEpisode,
            timeUntilSeconds,
            siteUrl: media.siteUrl,
            status: media.status ?? null,
            episodes: media.episodes ?? null,
        }
    } catch (error) {
        // Handle network errors and API errors
        if (error instanceof Error) {
            // Check if it's a network/connection error
            if (error.message.includes('fetch')) {
                throw new Error(
                    'Unable to reach AniList API. Please check your internet connection and try again.',
                )
            }
            throw new Error(`AniList API error: ${error.message}`)
        }
        throw new Error('An unknown error occurred while fetching anime information from AniList.')
    }
}

/**
 * GraphQL query for fetching anime recommendations by genre/tag
 */
const RECOMMENDATION_QUERY = `
  query ($genre: String) {
    Page(page: 1, perPage: 3) {
      media(genre_in: [$genre], type: ANIME, sort: POPULARITY_DESC) {
        title { english romaji }
        episodes
        averageScore
        siteUrl
      }
    }
  }
`

/**
 * Get top 3 anime recommendations by vibe/genre from AniList
 * 
 * @param vibe - The genre/vibe to search for (e.g., "action", "romance", "comedy")
 * @returns Array of Recommendation objects (up to 3), or empty array if none found
 * @throws Error if AniList API is unreachable
 */
export async function getRecommendations(vibe: string): Promise<Recommendation[]> {
    try {
        // Capitalize first letter for AniList genre format (e.g., "action" -> "Action")
        const genre = vibe.charAt(0).toUpperCase() + vibe.slice(1).toLowerCase()

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: RECOMMENDATION_QUERY,
                variables: {
                    genre: genre,
                },
            }),
        })

        // Check if request was successful
        if (!response.ok) {
            throw new Error(`AniList API returned status ${response.status}: ${response.statusText}`)
        }

        const data: AniListRecommendationResponse = await response.json()

        // Check if media array exists
        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return []
        }

        // Transform and return recommendations
        return data.data.Page.media.map((media) => {
            // Determine title (prefer english, then romaji)
            const title = media.title.english || media.title.romaji || 'Unknown'

            return {
                title,
                episodes: media.episodes ?? null,
                score: media.averageScore ?? null,
                siteUrl: media.siteUrl,
            }
        })
    } catch (error) {
        // Handle network errors and API errors
        if (error instanceof Error) {
            // Check if it's a network/connection error
            if (error.message.includes('fetch')) {
                throw new Error(
                    'Unable to reach AniList API. Please check your internet connection and try again.',
                )
            }
            throw new Error(`AniList API error: ${error.message}`)
        }
        throw new Error('An unknown error occurred while fetching anime recommendations from AniList.')
    }
}

