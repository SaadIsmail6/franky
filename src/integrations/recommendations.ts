/**
 * Smart Anime Recommendation Engine
 * Handles genre+mood, "if you liked X", length/style filters
 */

export interface EnhancedRecommendation {
    title: string
    episodes: number | null
    score: number | null
    siteUrl: string
    themes: string[] // genres/tags
    description?: string
}

export interface RecommendationQuery {
    type: 'genre_mood' | 'similar_to' | 'filtered'
    genres?: string[]
    moods?: string[]
    similarToTitle?: string
    episodeMin?: number
    episodeMax?: number
    sortBy?: 'popularity' | 'score' | 'trending'
    underrated?: boolean
}

/**
 * Parse user query into structured recommendation query
 */
export function parseRecommendationQuery(query: string): RecommendationQuery {
    const lower = query.toLowerCase().trim()
    
    // "if you liked X" or "like X" patterns
    const likeMatch = lower.match(/^(like|similar to|if you liked|recommend|based on)\s+(.+)$/i)
    if (likeMatch) {
        return {
            type: 'similar_to',
            similarToTitle: likeMatch[2].trim(),
        }
    }
    
    // Single word or short phrase that looks like a title (not a genre/mood keyword)
    const genreKeywords = ['dark', 'light', 'short', 'long', 'underrated', 'emotional', 'chill', 'slow', 'fast', 'intense', 'relaxing', 'sad', 'happy', 'funny', 'serious']
    const isGenreQuery = genreKeywords.some(keyword => lower.includes(keyword)) || 
                         lower.match(/\b(shonen|shoujo|seinen|josei|action|romance|comedy|drama|fantasy|horror|mystery|thriller|slice of life|sol|sports|supernatural|mecha|isekai|scifi|sci-fi)\b/)
    
    // If it's a single word/phrase and not a genre keyword, treat as title
    if (!isGenreQuery && query.split(/\s+/).length <= 3 && query.length > 2) {
        return {
            type: 'similar_to',
            similarToTitle: query.trim(),
        }
    }
    
    // Length/style filters
    const episodeMatch = lower.match(/(\d+)\s*episodes?/)
    const shortMatch = lower.match(/\b(short|quick)\b/)
    const longMatch = lower.match(/\b(long[- ]?running|long series)\b/)
    const underratedMatch = lower.match(/\b(underrated|hidden gem|sleeper)\b/)
    
    let episodeMin: number | undefined
    let episodeMax: number | undefined
    
    if (episodeMatch) {
        const count = parseInt(episodeMatch[1])
        episodeMin = count - 5
        episodeMax = count + 5
    } else if (shortMatch) {
        episodeMax = 13
    } else if (longMatch) {
        episodeMin = 50
    }
    
    // Extract genres and moods
    const genreMap: Record<string, string> = {
        'shonen': 'Shounen',
        'shoujo': 'Shoujo',
        'seinen': 'Seinen',
        'josei': 'Josei',
        'action': 'Action',
        'romance': 'Romance',
        'comedy': 'Comedy',
        'drama': 'Drama',
        'fantasy': 'Fantasy',
        'sci-fi': 'Sci-Fi',
        'scifi': 'Sci-Fi',
        'sci fi': 'Sci-Fi',
        'horror': 'Horror',
        'mystery': 'Mystery',
        'thriller': 'Thriller',
        'slice of life': 'Slice of Life',
        'sol': 'Slice of Life',
        'sports': 'Sports',
        'supernatural': 'Supernatural',
        'mecha': 'Mecha',
        'isekai': 'Isekai',
    }
    
    const moodMap: Record<string, string> = {
        'dark': 'Dark',
        'light': 'Light',
        'emotional': 'Drama',
        'chill': 'Slice of Life',
        'slow': 'Slice of Life',
        'fast': 'Action',
        'intense': 'Action',
        'relaxing': 'Slice of Life',
        'sad': 'Drama',
        'happy': 'Comedy',
        'funny': 'Comedy',
        'serious': 'Drama',
    }
    
    const genres: string[] = []
    const moods: string[] = []
    
    // Extract genres
    for (const [key, value] of Object.entries(genreMap)) {
        if (lower.includes(key)) {
            genres.push(value)
        }
    }
    
    // Extract moods (which map to genres/tags)
    for (const [key, value] of Object.entries(moodMap)) {
        if (lower.includes(key) && !genres.includes(value)) {
            moods.push(value)
        }
    }
    
    // If no genres found, try to infer from common patterns
    if (genres.length === 0 && moods.length === 0) {
        // Default to action if nothing specific
        if (lower.length > 0) {
            genres.push('Action')
        }
    }
    
    return {
        type: 'filtered',
        genres: genres.length > 0 ? genres : undefined,
        moods: moods.length > 0 ? moods : undefined,
        episodeMin,
        episodeMax,
        sortBy: underratedMatch ? 'score' : 'popularity',
        underrated: !!underratedMatch,
    }
}

/**
 * Fetch recommendations from AniList based on query
 */
export async function fetchRecommendations(
    query: RecommendationQuery,
    limit: number = 10
): Promise<EnhancedRecommendation[]> {
    if (query.type === 'similar_to' && query.similarToTitle) {
        return await fetchSimilarAnime(query.similarToTitle, limit)
    }
    
    return await fetchFilteredAnime(query, limit)
}

/**
 * Fetch anime similar to a given title
 */
async function fetchSimilarAnime(title: string, limit: number): Promise<EnhancedRecommendation[]> {
    // First, find the anime by title
    const searchQuery = `
        query ($search: String) {
            Media(search: $search, type: ANIME) {
                id
                title { english romaji }
                genres
                tags { name }
                recommendations(perPage: ${limit}, sort: RATING_DESC) {
                    nodes {
                        mediaRecommendation {
                            id
                            title { english romaji }
                            episodes
                            averageScore
                            siteUrl
                            genres
                            tags { name }
                            description(asHtml: false)
                        }
                    }
                }
            }
        }
    `
    
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: searchQuery,
                variables: { search: title },
            }),
        })
        
        if (!response.ok) {
            throw new Error(`AniList API returned status ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.data?.Media?.recommendations?.nodes) {
            // Fallback: search by genre if no recommendations found
            const media = data.data?.Media
            if (media?.genres && media.genres.length > 0) {
                return await fetchFilteredAnime(
                    {
                        type: 'filtered',
                        genres: media.genres.slice(0, 2),
                        sortBy: 'popularity',
                    },
                    limit
                )
            }
            return []
        }
        
        return data.data.Media.recommendations.nodes
            .map((node: any) => {
                const media = node.mediaRecommendation
                if (!media) return null
                
                const title = media.title.english || media.title.romaji || 'Unknown'
                const themes = [
                    ...(media.genres || []).slice(0, 3),
                    ...(media.tags || []).slice(0, 2).map((t: any) => t.name),
                ]
                
                return {
                    title,
                    episodes: media.episodes ?? null,
                    score: media.averageScore ?? null,
                    siteUrl: media.siteUrl,
                    themes: themes.slice(0, 5),
                    description: media.description ? stripHtml(media.description).substring(0, 150) : undefined,
                }
            })
            .filter((r: any) => r !== null)
            .slice(0, limit)
    } catch (error) {
        console.error('[RECOMMEND] Error fetching similar anime:', error)
        return []
    }
}

/**
 * Fetch filtered anime based on genres, moods, episode count, etc.
 */
async function fetchFilteredAnime(
    query: RecommendationQuery,
    limit: number
): Promise<EnhancedRecommendation[]> {
    const allGenres = [
        ...(query.genres || []),
        ...(query.moods || []),
    ]
    
    // Build filter conditions
    const genreFilter = allGenres.length > 0 
        ? `genre_in: [${allGenres.map(g => `"${g}"`).join(', ')}]`
        : ''
    
    const episodeFilter = []
    if (query.episodeMin !== undefined) {
        episodeFilter.push(`episodes_greater: ${query.episodeMin}`)
    }
    if (query.episodeMax !== undefined) {
        episodeFilter.push(`episodes_lesser: ${query.episodeMax}`)
    }
    
    const sortField = query.sortBy === 'score' 
        ? 'SCORE_DESC' 
        : query.sortBy === 'trending'
        ? 'TRENDING_DESC'
        : 'POPULARITY_DESC'
    
    // For underrated, we want high score but lower popularity
    const popularityFilter = query.underrated 
        ? 'popularity_lesser: 50000'
        : ''
    
    const filterParts = [
        genreFilter,
        ...episodeFilter,
        popularityFilter,
        'type: ANIME',
        'status: FINISHED',
    ].filter(Boolean)
    
    const filterPartsFinal = [
        ...filterParts,
        `sort: ${sortField}`,
    ]
    
    const filterString = filterPartsFinal.length > 0 
        ? `(${filterPartsFinal.join(', ')})`
        : '(type: ANIME, status: FINISHED, sort: POPULARITY_DESC)'
    
    const searchQuery = [
        'query ($page: Int, $perPage: Int) {',
        '  Page(page: $page, perPage: $perPage) {',
        `    media${filterString} {`,
        '      id',
        '      title { english romaji }',
        '      episodes',
        '      averageScore',
        '      siteUrl',
        '      genres',
        '      tags { name }',
        '      description(asHtml: false)',
        '    }',
        '  }',
        '}',
    ].join('\n')
    
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: searchQuery,
                variables: {
                    page: 1,
                    perPage: limit,
                },
            }),
        })
        
        if (!response.ok) {
            throw new Error(`AniList API returned status ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.data?.Page?.media) {
            return []
        }
        
        return data.data.Page.media.map((media: any) => {
            const title = media.title.english || media.title.romaji || 'Unknown'
            const themes = [
                ...(media.genres || []).slice(0, 3),
                ...(media.tags || []).slice(0, 2).map((t: any) => t.name),
            ]
            
            return {
                title,
                episodes: media.episodes ?? null,
                score: media.averageScore ?? null,
                siteUrl: media.siteUrl,
                themes: themes.slice(0, 5),
                description: media.description ? stripHtml(media.description).substring(0, 150) : undefined,
            }
        })
    } catch (error) {
        console.error('[RECOMMEND] Error fetching filtered anime:', error)
        return []
    }
}

/**
 * Format score for display
 */
function formatScore(score: number | null): string {
    if (score === null) return 'N/A'
    return (score / 10).toFixed(1)
}

/**
 * Format episode count
 */
function formatEpisodes(episodes: number | null): string {
    if (episodes === null) return '?'
    return episodes.toString()
}

/**
 * Format themes/genres list
 */
function formatThemes(themes: string[]): string {
    if (themes.length === 0) return '—'
    return themes.slice(0, 4).join(', ')
}

/**
 * Format recommendations into a clean multi-line list
 */
export function formatRecommendations(
    recs: EnhancedRecommendation[],
    query: string
): string {
    if (recs.length === 0) {
        return `No recommendations found for "${query}". Try a different query!`
    }
    
    const lines: string[] = []
    lines.push(`🎯 **${recs.length} Recommendation${recs.length > 1 ? 's' : ''}**`)
    lines.push('')
    
    recs.forEach((rec, index) => {
        const num = index + 1
        const title = rec.title
        const episodes = formatEpisodes(rec.episodes)
        const score = formatScore(rec.score)
        const themes = formatThemes(rec.themes)
        
        lines.push(`${num}. **${title}**`)
        lines.push(`   ${episodes} eps • ${score}/10 • ${themes}`)
        if (rec.description) {
            const desc = rec.description.length > 120 ? rec.description.substring(0, 120) + '...' : rec.description
            lines.push(`   ${desc}`)
        }
        lines.push('')
    })
    
    return lines.join('\n').trim()
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
}

