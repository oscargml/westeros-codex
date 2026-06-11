import type { Character } from "./types";

/**
 * Zero-dependency fuzzy matcher.
 * Scores a candidate string against a query: exact substring > word-prefix > in-order character subsequence.
 */
function fuzzyScore(query: string, candidate: string): number {
  const q = query.toLowerCase().trim();
  const c = candidate.toLowerCase();
  if (!q) return 0;
  if (c === q) return 100;
  if (c.includes(q)) return 80 - Math.min(30, c.indexOf(q));
  // word-prefix match
  if (c.split(/\s+/).some((w) => w.startsWith(q))) return 60;
  // in-order subsequence
  let qi = 0;
  for (let ci = 0; ci < c.length && qi < q.length; ci++) {
    if (c[ci] === q[qi]) qi++;
  }
  if (qi === q.length) return Math.max(10, 40 - (c.length - q.length));
  return 0;
}

export interface SearchResult {
  character: Character;
  score: number;
  matchedOn: string;
}

/** Fuzzy-search across name, aliases, titles, keywords, biography text, and appearances. */
export function searchCharacters(query: string, pool: Character[]): SearchResult[] {
  if (!query.trim()) return pool.map((character) => ({ character, score: 0, matchedOn: "" }));

  const results: SearchResult[] = [];
  for (const character of pool) {
    const fields: Array<[string, string, number]> = [
      ["name", character.name, 1.0],
      ...character.aliases.map((a): [string, string, number] => ["alias", a, 0.9]),
      ...character.titles.map((t): [string, string, number] => ["title", t, 0.7]),
      ...character.keywords.map((k): [string, string, number] => ["keyword", k, 0.8]),
      ["debut", character.firstAppearance.title, 0.6],
      ["house", character.house, 0.6],
      ["bio", character.biography.join(" ").slice(0, 2000), 0.4],
    ];
    let best = 0;
    let matchedOn = "";
    for (const [label, text, weight] of fields) {
      const s = fuzzyScore(query, text) * weight;
      if (s > best) {
        best = s;
        matchedOn = label === "name" ? "" : `${label}: ${text.slice(0, 40)}`;
      }
    }
    if (best > 12) results.push({ character, score: best, matchedOn });
  }
  return results.sort((a, b) => b.score - a.score);
}
