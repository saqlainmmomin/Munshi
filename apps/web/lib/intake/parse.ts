// Best-effort fact extraction from pasted listing text (PRD §8.4). Manual
// intake rarely fills the structured form fields — the numbers are already
// in the raw paste ("Rent: ₹75,000", "2 BHK", "Koramangala 5th Block").
// This is a heuristic, not a parser: it only fills a field the submitter
// left blank, and any field it can't find stays null → missing_fields (the
// auto-verify path, PRD §5.4), never a guess.

const AMOUNT = /₹?\s*([\d][\d,\s]*\d|\d)\s*(k\b|lac\b|lakh\b)?/i;

function parseAmount(text: string): number | null {
  const m = text.match(AMOUNT);
  if (!m) return null;
  const digits = m[1].replace(/[,\s]/g, "");
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = m[2]?.toLowerCase();
  if (unit === "k") return n * 1_000;
  if (unit === "lac" || unit === "lakh") return n * 100_000;
  return n;
}

/** Rent: the number after the word "rent", stopping before deposit/brokerage/maintenance callouts. */
export function extractRent(text: string): number | null {
  const stop = /\b(deposit|brokerage|maintenance|security)\b/i;
  for (const line of text.split(/\r?\n/)) {
    const idx = line.search(/rent/i);
    if (idx === -1) continue;
    let segment = line.slice(idx + "rent".length);
    const stopMatch = segment.search(stop);
    if (stopMatch !== -1) segment = segment.slice(0, stopMatch);
    const amount = parseAmount(segment);
    // Below ~1000, this is almost certainly not a rent figure (a room
    // number, a street name like "80ft Road" caught by a stray "for Rent"
    // earlier in the text) — keep scanning for a plausible line instead.
    if (amount != null && amount >= 1000) return amount;
  }
  return null;
}

/** BHK: the digit immediately before "BHK" ("2 BHK", "3BHK", "1 BHK (Unfurnished)"). */
export function extractBhk(text: string): number | null {
  const m = text.match(/(\d)\s*[- ]?\s*bhk/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n > 0 && n <= 9 ? n : null;
}

// Pilot corridor (PRD §1) plus the neighboring areas that actually show up
// in Bengaluru rental listings around it.
const KNOWN_AREAS = [
  "Koramangala", "Indiranagar", "Domlur", "Cox Town", "Ulsoor",
  "HSR Layout", "BTM Layout", "Jayanagar", "Whitefield", "Old Airport Road",
  "Rustam Bagh", "MG Road", "Brigade Road", "CV Raman Nagar",
  "Embassy Golf Links", "EGL",
];

/**
 * Area: the known corridor-area name that appears *earliest* in the text —
 * listings tend to state the actual location up front and mention nearby
 * landmarks ("close to Brigade Road") later, so first-mentioned wins over
 * e.g. checking a fixed priority list.
 */
export function extractArea(text: string): string | null {
  let best: { area: string; index: number } | null = null;
  for (const area of KNOWN_AREAS) {
    const re = new RegExp(`\\b${area.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const m = re.exec(text);
    if (m && (best === null || m.index < best.index)) {
      best = { area, index: m.index };
    }
  }
  return best?.area ?? null;
}

export interface ParsedIntakeFacts {
  rent: number | null;
  bhk: number | null;
  area: string | null;
}

/** Structured fields the submitter typed take priority; parsing only fills gaps. */
export function parseIntakeFacts(
  rawText: string,
  structured: Record<string, unknown>,
): ParsedIntakeFacts {
  const rent = typeof structured.rent === "number" ? structured.rent : extractRent(rawText);
  const bhk = typeof structured.bhk === "number" ? structured.bhk : extractBhk(rawText);
  const area = typeof structured.area === "string" ? structured.area : extractArea(rawText);
  return { rent, bhk, area };
}
