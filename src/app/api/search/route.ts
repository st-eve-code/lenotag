import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs-extra";
import {
  VAPE_CATEGORIES,
  SCS_SITE,
  DMT_SITE,
  WM_SITE,
  SHOPPUFF_SITE,
  OCHO_SITE,
  DRUG_BUCKETS,
  BESOS_SITE,
  MADLABS_SITE,
  CALICLEAR_SITE,
  HITZ_SITE,
} from "@/lib/catalog";

const ROOT = process.cwd();
const METADATA_DIR = path.join(ROOT, "data", "scraped", "metadata");
const MAX_RESULTS = 24;

export interface SearchResult {
  slug: string;
  category: string;
  title: string;
  brand?: string;
  href: string;
}

// ── Synonym / alias map ───────────────────────────────────────────────────────
// Maps a user's search term to extra tokens that should also be searched.
// All keys and values must be lowercase.
const SYNONYMS: Record<string, string[]> = {
  // cocaine aliases
  coke: ["cocaine", "coca", "bolivian", "peruvian", "colombian", "crack"],
  coca: ["cocaine"],
  blow: ["cocaine"],
  snow: ["cocaine"],
  charlie: ["cocaine"],
  crack: ["cocaine", "crack"],
  // opioid aliases
  lean: ["codeine", "promethazine", "syrup", "wock"],
  syrup: ["codeine", "promethazine"],
  oxy: ["oxycodone", "oxycontin", "percocet"],
  percs: ["percocet", "oxycodone"],
  fent: ["fentanyl"],
  dope: ["heroin"],
  smack: ["heroin"],
  // benzo aliases
  xans: ["xanax", "alprazolam"],
  bars: ["xanax", "alprazolam"],
  // stimulant aliases
  meth: ["methamphetamine", "crystal"],
  crystal: ["methamphetamine", "meth"],
  speed: ["amphetamine", "methamphetamine"],
  addy: ["adderall", "amphetamine"],
  // psychedelic aliases
  shrooms: ["mushroom", "psilocybin", "psilocybe"],
  mushies: ["mushroom", "psilocybin"],
  tabs: ["lsd", "blotter"],
  acid: ["lsd", "blotter"],
  molly: ["mdma", "ecstasy"],
  pills: ["mdma", "ecstasy", "pill", "tablet"],
  pill: ["mdma", "ecstasy", "tablet"],
  // vape aliases
  vapes: ["vape", "e-liquid", "eliquid", "mod", "pod", "kit"],
  vaping: ["vape", "e-liquid", "eliquid"],
  ejuice: ["e-liquid", "eliquid"],
  "e-juice": ["e-liquid", "eliquid"],
  juice: ["e-liquid", "eliquid"],
  // cannabis aliases
  weed: ["cannabis", "marijuana", "bud", "flower", "thc"],
  pot: ["cannabis", "marijuana", "bud"],
  ganja: ["cannabis", "marijuana"],
  bud: ["flower", "cannabis"],
  dabs: ["concentrate", "wax", "shatter", "resin"],
  edibles: ["edible", "chocolate", "gummy"],
  // ketamine aliases
  ket: ["ketamine"],
  // ghb aliases
  ghb: ["gamma"],
  // dmt aliases
  deems: ["dmt"],
};

/** Expand a query token into itself plus any synonyms */
function expandToken(token: string): string[] {
  return [token, ...(SYNONYMS[token] ?? [])];
}

// ── Search index ──────────────────────────────────────────────────────────────
interface IndexEntry extends SearchResult {
  // Lowercase searchable text blob: title + brand + slug + category + tags
  searchText: string;
}

let _index: IndexEntry[] | null = null;
let _indexBuilding: Promise<IndexEntry[]> | null = null;

interface FlatEntry {
  slug: string;
  name?: string;
  vendor?: string;
  tags?: string[];
  category?: string;
  collections?: string[];
}

// Replicate the drug bucket classifier (avoids importing full catalog.ts)
const DRUG_PATTERNS = DRUG_BUCKETS.map((b) => ({
  bucket: b.bucket,
  patterns: b.patterns,
}));

function classifyDrugBucket(p: FlatEntry): string {
  const name = (p.name ?? "").toLowerCase();
  for (const { bucket, patterns } of DRUG_PATTERNS) {
    if (patterns.some((re) => re.test(name))) return bucket;
  }
  const tags = (p.tags ?? []).join(" ").toLowerCase();
  for (const { bucket, patterns } of DRUG_PATTERNS) {
    if (patterns.some((re) => re.test(tags))) return bucket;
  }
  return "other";
}

function classifyDisposableEntry(p: FlatEntry): string {
  const hay = `${p.name ?? ""} ${(p.collections ?? []).join(" ")} ${p.category ?? ""}`.toLowerCase();
  if (/pod|cartridge|cart/.test(hay)) return "prefilled-pods";
  if (/coil/.test(hay)) return "coils";
  if (/tank/.test(hay)) return "vape-tanks";
  if (/mod|kit|device|starter/.test(hay)) return "vape-kits";
  if (/liquid|juice|e-juice|salt/.test(hay) && !/pouch|gum/.test(hay)) return "e-liquid";
  if (/pouch/.test(hay)) return "nicotine-pouches";
  if (/gum|strip/.test(hay)) return "nicotine-gum";
  if (/accessor/.test(hay)) return "vape-accessories";
  if (/(?:disposable|hitz|besos|mad\s*labs|cali\s*clear)/.test(hay)) {
    if (/kit|device/.test(hay)) return "vape-kits";
    return "prefilled-pods";
  }
  return "prefilled-pods";
}

function makeEntry(
  slug: string,
  category: string,
  title: string,
  brand: string | undefined,
  tags: string[]
): IndexEntry {
  const searchText = [title, brand ?? "", slug.replace(/-/g, " "), category.replace(/-/g, " "), ...tags]
    .join(" ")
    .toLowerCase();
  return {
    slug,
    category,
    title,
    brand,
    href: `/shop/${category}/${slug}`,
    searchText,
  };
}

async function buildIndex(): Promise<IndexEntry[]> {
  const entries: IndexEntry[] = [];

  // 1. Vapestore — each category has an items[] in its index.json
  await Promise.all(
    VAPE_CATEGORIES.map(async ([category]) => {
      try {
        const data = await fs.readJson(path.join(METADATA_DIR, category, "index.json"));
        const items: Array<{ slug: string; title: string; brand?: string }> = data?.items ?? [];
        for (const item of items) {
          entries.push(makeEntry(item.slug, category, item.title ?? item.slug, item.brand, []));
        }
      } catch {
        // category missing — skip
      }
    })
  );

  // 2. Flat sources (SCS, DMT, weedmaps, shoppuff, ocho, disposable shops)
  const flatSites: Array<{ site: string; categoryFn: (p: FlatEntry) => string }> = [
    { site: SCS_SITE, categoryFn: classifyDrugBucket },
    { site: DMT_SITE, categoryFn: classifyDrugBucket },
    { site: WM_SITE, categoryFn: (p) => p.category ?? "cannabinoids" },
    { site: SHOPPUFF_SITE, categoryFn: (p) => p.category ?? "cannabinoids" },
    { site: OCHO_SITE, categoryFn: (p) => p.category ?? "cannabinoids" },
    { site: BESOS_SITE, categoryFn: classifyDisposableEntry },
    { site: MADLABS_SITE, categoryFn: classifyDisposableEntry },
    { site: CALICLEAR_SITE, categoryFn: classifyDisposableEntry },
    { site: HITZ_SITE, categoryFn: classifyDisposableEntry },
  ];

  await Promise.all(
    flatSites.map(async ({ site, categoryFn }) => {
      try {
        const data = await fs.readJson(path.join(METADATA_DIR, site, "index.json"));
        const items: FlatEntry[] = Array.isArray(data) ? data : [];
        for (const item of items) {
          const cat = categoryFn(item);
          entries.push(
            makeEntry(item.slug, cat, item.name ?? item.slug, item.vendor, item.tags ?? [])
          );
        }
      } catch {
        // site missing - skip
      }
    })
  );

  return entries;
}

async function getIndex(): Promise<IndexEntry[]> {
  if (_index) return _index;
  if (_indexBuilding) return _indexBuilding;
  _indexBuilding = buildIndex().then((idx) => {
    _index = idx;
    _indexBuilding = null;
    return idx;
  });
  return _indexBuilding;
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function scoreEntry(entry: IndexEntry, expandedTokens: string[]): number {
  const title = entry.title.toLowerCase();
  let s = 0;

  for (const token of expandedTokens) {
    if (!token) continue;

    // Exact word boundary match in title — highest value
    if (title.includes(token)) {
      // Prefer matches at word boundaries (start of word)
      const wordBoundary = new RegExp(`(^|[\\s\\-,/])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      s += wordBoundary.test(title) ? 12 : 7;
    }

    // Anywhere in the full search text (title + brand + slug + tags)
    if (entry.searchText.includes(token)) {
      s += 3;
    }
  }

  return s;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest): Promise<NextResponse> {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  // Tokenise and expand with synonyms
  const rawTokens = q.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 0);
  if (!rawTokens.length) return NextResponse.json({ results: [] });

  const expandedTokens = [...new Set(rawTokens.flatMap(expandToken))];

  const index = await getIndex();

  // Score every entry
  const scored = index
    .map((entry) => ({ entry, s: scoreEntry(entry, expandedTokens) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, MAX_RESULTS * 2); // over-fetch to allow dedup

  // Deduplicate by href
  const seen = new Set<string>();
  const results: SearchResult[] = [];
  for (const { entry } of scored) {
    if (!seen.has(entry.href)) {
      seen.add(entry.href);
      results.push({
        slug: entry.slug,
        category: entry.category,
        title: entry.title,
        brand: entry.brand,
        href: entry.href,
      });
      if (results.length >= MAX_RESULTS) break;
    }
  }

  return NextResponse.json({ results });
}
