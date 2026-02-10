/**
 * Franky v2 – safety and content filters.
 * No piracy, no explicit content, anime-only, non-graphic violence.
 */

const OFF_TOPIC_PATTERNS = [
  /crypto|bitcoin|ethereum|nft|wallet\s*connect/i,
  /sports\s*score|football|nfl|soccer/i,
  /weather|recipe|cooking/i,
  /political|election|vote/i,
]

const EXPLICIT_PATTERNS = [
  /hentai|ecchi\s*only|explicit\s*content|nsfw\s*only/i,
]

const PIRACY_PATTERNS = [
  /free\s*stream|pirate|torrent|watch\s*free\s*online|illegal\s*stream/i,
]

export function isOffTopic(text: string): boolean {
  return OFF_TOPIC_PATTERNS.some((p) => p.test(text))
}

export function containsExplicitRequest(text: string): boolean {
  return EXPLICIT_PATTERNS.some((p) => p.test(text))
}

export function containsPiracyRequest(text: string): boolean {
  return PIRACY_PATTERNS.some((p) => p.test(text))
}

export function filterResponseText(text: string): string {
  let out = text
  // Remove any raw URLs that look like piracy
  out = out.replace(/https?:\/\/[^\s]*(?:stream|torrent|pirate)[^\s]*/gi, '[link removed]')
  return out
}

export function getRedirectMessage(): string {
  return "I'm an anime-focused agent. Ask me about recommendations, characters, watch orders, or what's trending."
}

const NON_ANIME_TOPICS = [
  /tcg|trading\s*card|magic\s*the\s*gathering|pokemon\s*card|yugioh\s*card/i,
  /crypto|bitcoin|nft|wallet|blockchain/i,
  /sports\s*score|nfl|football\s*match|soccer\s*result/i,
  /weather|recipe|cooking\s*show/i,
  /political|election|vote\s*for/i,
]

export function isAnimeOnlyReject(text: string): boolean {
  return NON_ANIME_TOPICS.some((p) => p.test(text))
}

export const ANIME_ONLY_MESSAGE = "I'm Franky — I only handle anime 🎌"
