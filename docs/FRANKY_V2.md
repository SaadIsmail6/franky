# Franky v2 – Anime Intelligence Agent

Franky v2 is a natural-language anime agent that runs alongside the legacy slash-command bot. Enable it with the environment variable:

```bash
FRANKY_V2=true
```

When enabled, messages that mention **@franky** or **franky**, or start with phrases like **"what should I watch"**, are handled by the v2 agent (intent classifier → tool router → formatter).

## Manual verification flows

1. **Recommendations**  
   - "what should I watch" → may ask for vibe (dark/comfy, short/long) or return picks.  
   - "@franky something like attack on titan" → similar anime list.

2. **Character**  
   - "who is gojo" → character summary (role, traits, anime).

3. **Watch order**  
   - "watch order for fate" → ordered list (e.g. Fate/Zero → UBW → HF).  
   - "watch order for monogatari" → Monogatari order.

4. **Trending / seasonal**  
   - "what's trending this season" → trending anime.  
   - "this season anime" → current seasonal list.

5. **Quiz / trivia**  
   - "quiz me" → multiple-choice anime question.  
   - "tell me a fact" → anime trivia.

6. **Ranking**  
   - "top anime" or "ranking" → trending/ranked list.

## Running tests

```bash
bun test
```

Covers intent classifier, safety filters, and session memory store.

## Cutover

Once v2 is stable, set `FRANKY_V2=true` in production and consider making v2 the default path (e.g. remove the trigger check so all messages go through the agent). Legacy slash commands remain available unless removed from the bot.
