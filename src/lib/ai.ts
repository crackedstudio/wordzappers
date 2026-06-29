const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-v4-flash';

function apiKey(): string {
  return import.meta.env.VITE_DEEPSEEK_KEY ?? '';
}

async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  const key = apiKey();
  if (!key || key === 'your_key_here') throw new Error('DeepSeek API key not set in .env.local');

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens: 200,
      temperature: 0.8,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── Hint ──────────────────────────────────────────────────────────────────────

export async function getHint(nowWord: string, nextWord: string, target: string): Promise<string> {
  return chat(
    `You are a cryptic-but-fair hint bot for a word ladder game.
The player changes one letter at a time to reach a target word.
Rules:
- NEVER reveal the next word directly
- Give a clue in under 20 words
- Be clever, playful, and just cryptic enough to make them think
- You may use wordplay, definitions, rhymes, or associations`,
    `Current word: ${nowWord}
Next word to find: ${nextWord} (don't say this!)
Final target: ${target}
Give a hint for the NEXT word only.`
  );
}

// ── Puzzle generation ─────────────────────────────────────────────────────────

export interface AIPuzzle {
  start: string;
  end:   string;
  path:  string[];
}

function diffCount(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function validatePuzzle(p: AIPuzzle): boolean {
  if (!p.path || p.path.length < 3 || p.path.length > 10) return false;
  if (p.path[0] !== p.start || p.path[p.path.length - 1] !== p.end) return false;
  // All words must be same length
  const len = p.path[0].length;
  for (let i = 1; i < p.path.length; i++) {
    if (p.path[i].length !== len) return false;
    if (diffCount(p.path[i - 1], p.path[i]) !== 1) return false;
  }
  return true;
}

export async function generateDailyPuzzle(dateStr: string): Promise<AIPuzzle> {
  const cacheKey = `ai-puzzle-${dateStr}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const p = JSON.parse(cached) as AIPuzzle;
      if (validatePuzzle(p)) return p;
    } catch { /* fall through to generate */ }
  }

  const raw = await chat(
    `You are a word ladder puzzle generator for a challenging word game.
Rules:
- All words MUST be common English words (no proper nouns, no obscure words)
- Prefer 5 or 6-letter words for a harder puzzle; 4-letter is a fallback only
- ALL words in the path must be the SAME length
- Each step changes EXACTLY one letter (no additions, no removals)
- Path must have 6 to 9 words total (the longer the better)
- Words must be family-friendly
- Choose thematically interesting start/end pairs (opposites, related concepts)
- Return ONLY valid JSON, no explanation`,
    `Generate a challenging word ladder puzzle for date ${dateStr}.
Format: {"start":"WORD","end":"WORD","path":["WORD","WORD","WORD","WORD","WORD","WORD","WORD"]}
Verify every adjacent pair differs by exactly one letter before responding.`
  );

  // Extract JSON even if model adds surrounding text
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');

  const puzzle = JSON.parse(match[0]) as AIPuzzle;
  // Uppercase all words
  puzzle.path  = puzzle.path.map(w => w.toUpperCase());
  puzzle.start = puzzle.path[0];
  puzzle.end   = puzzle.path[puzzle.path.length - 1];

  if (!validatePuzzle(puzzle)) throw new Error('Invalid puzzle path');

  localStorage.setItem(cacheKey, JSON.stringify(puzzle));
  return puzzle;
}
