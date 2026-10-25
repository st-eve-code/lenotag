import fs from "fs-extra";
import path from "path";

const ROOT = process.cwd();
export const IMAGES_DIR = path.join(ROOT, "data", "scraped", "images");
const METADATA_DIR = path.join(ROOT, "data", "scraped", "metadata");

// Index files are static once scraped, so memoise them for the process lifetime.
// This keeps the nav + header from re-reading the multi-megabyte source indexes
// on every render. Individual product files (readItem) are intentionally not
// cached — there are tens of thousands of them.
const jsonCache = new Map<string, Promise<unknown>>();
function readJsonCached(file: string): Promise<unknown> {
  let pending = jsonCache.get(file);
  if (!pending) {
    pending = fs.readJson(file).catch(() => null);
    jsonCache.set(file, pending);
  }
  return pending;
}

export interface CatalogImage {
  file: string;
  url: string;
  position: number;
  width?: number;
  height?: number;
  downloaded: boolean;
}

export interface CatalogVariant {
  title: string;
  sku?: string;
  price: number;
}

export interface CatalogItem {
  site: string;
  category: string;
  id: string;
  slug: string;
  title: string;
  url: string;
  brand?: string;
  productType?: string;
  price?: { min: number; max: number; currency: string };
  description?: string;
  tags: string[];
  images: CatalogImage[];
  scrapedAt: string;
}

export interface IndexEntry {
  slug: string;
  title: string;
  url: string;
  brand?: string;
  price?: number;
  images: number;
}

export interface CategoryIndex {
  category: string;
  site: string;
  label: string;
  source: string;
  count: number;
  images: number;
  scrapedAt: string;
  items: IndexEntry[];
}

export interface RootIndex {
  updatedAt: string;
  categories: Array<{
    category: string;
    label: string;
    site: string;
    source?: string;
    count: number;
    images: number;
    scrapedAt?: string;
  }>;
}

export { imageSrc } from "./image";

export async function readRootIndex(): Promise<RootIndex | null> {
  const data = await readJsonCached(path.join(METADATA_DIR, "index.json"));
  return (data as RootIndex | null) ?? null;
}

export async function readCategoryIndex(category: string): Promise<CategoryIndex | null> {
  const data = await readJsonCached(path.join(METADATA_DIR, category, "index.json"));
  return (data as CategoryIndex | null) ?? null;
}

export async function readItem(category: string, slug: string): Promise<CatalogItem | null> {
  try {
    return await fs.readJson(path.join(METADATA_DIR, category, `${slug}.json`));
  } catch {
    return null;
  }
}

export function cover(item: CatalogItem): CatalogImage | undefined {
  return item.images[0];
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "\u00a3",
  USD: "$",
  EUR: "\u20ac",
};

export function priceLabel(item: CatalogItem): string {
  if (!item.price) return "";
  const { min, max, currency } = item.price;
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const format = (n: number) => `${symbol}${n.toFixed(2)}`;
  if (min === max) return format(min);
  return `${format(min)} \u2013 ${format(max)}`;
}

// ── Description cleaning ──────────────────────────────────────────────────────
// Product descriptions come from HTML/JSON and often contain external
// links, source references, timestamps and other noise. This function
// strips everything down to clean, concise plain text.

// Lines matching these patterns are removed entirely.
const DESCRIPTION_REJECT_PATTERNS: RegExp[] = [
  /\bscrape[ds]?\b/i,
  /\bsource\b/i,
  /\boriginal (listing|page|site|url|product|source)\b/i,
  /\bvisit (our |the |their )?(online )?(shop|store|site|website|page|retailer)\b/i,
  /\bclick (here|the link|below)\b/i,
  /\bbuy (now|here|online|this|today)\b/i,
  /\bshop (now|here|this)\b/i,
  /\border (now|here|online|today)\b/i,
  /\bcheck (it )?out\b/i,
  /\bview (our |the )?(full )?(range|catalog|collection|listing|products?)\b/i,
  /\blast (updated|scraped|crawled)\b/i,
  /\bdata (collected|scraped|gathered|retrieved)\b/i,
  /\bproduct (was |is )?scraped\b/i,
  /\bspider|crawled|harvested\b/i,
  /https?:\/\//i,
  /\bwww\./i,
  /\.(com|net|org|io|co\.uk|de|nl)\b/i,
  /\b\d{4}-\d{2}-\d{2}T/i, // ISO date stamps
];

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_DESCRIPTION_PARAGRAPHS = 3;

/**
 * Cleans a product description by stripping HTML, removing external links,
 * source references and scrape metadata, and truncating to a concise length.
 * Returns an array of paragraph strings ready to render.
 */
export function cleanDescription(
  html?: string,
  plain?: string
): string[] {
  let text: string;

  if (html?.trim()) {
    // Remove anchor tags and their text content entirely.
    text = html.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
    // Remove images, scripts, styles.
    text = text.replace(/<(img|script|style|iframe)[^>]*>/gi, "");
    // Strip remaining HTML tags.
    text = text.replace(/<[^>]+>/g, " ");
    // Decode common HTML entities.
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z#0-9]+;/gi, " ");
  } else {
    text = plain ?? "";
  }

  // Split into paragraphs/lines and clean each one.
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cleaned: string[] = [];
  for (const line of lines) {
    // Remove URLs from within lines.
    const withoutUrls = line
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/\bwww\.[^\s]+/g, "")
      .trim();

    if (!withoutUrls) continue;

    // Skip lines that match reject patterns.
    if (DESCRIPTION_REJECT_PATTERNS.some((re) => re.test(withoutUrls))) continue;

    // Collapse excessive whitespace.
    const normalised = withoutUrls.replace(/\s{2,}/g, " ");
    if (normalised) cleaned.push(normalised);
  }

  // Truncate to a reasonable length.
  const result: string[] = [];
  let totalLen = 0;
  for (const para of cleaned) {
    if (result.length >= MAX_DESCRIPTION_PARAGRAPHS) break;
    if (totalLen + para.length > MAX_DESCRIPTION_LENGTH) {
      const remaining = MAX_DESCRIPTION_LENGTH - totalLen;
      if (remaining > 40) {
        result.push(para.slice(0, remaining).trim() + "\u2026");
      }
      break;
    }
    result.push(para);
    totalLen += para.length;
  }

  return result;
}

// ── Sources ──────────────────────────────────────────────────────────────────
export const WM_SITE = "weedmaps-com";
export const SCS_SITE = "streetcocaineshop-com";
export const K2_SITE = "k2spicesprayshop-com";
export const DMT_SITE = "dmtshopping-com";
export const SHOPPUFF_SITE = "shoppuff-com";
export const OCHO_SITE = "ochoextracts-com";
export const BESOS_SITE = "besos-store";
export const MADLABS_SITE = "madlabsbrand-com";
export const CALICLEAR_SITE = "caliclearvapes-com";
export const HITZ_SITE = "hitzdisposablez-com";

// ── Unified taxonomy ─────────────────────────────────────────────────────────
// Products are grouped by *concept*, not by source, so the same kind of product
// always lands in the same category no matter which site it was scraped from.

export type CategoryGroup = "vapes" | "cannabis" | "recreational";

export function groupLabel(group: CategoryGroup): string {
  if (group === "cannabis") return "Cannabis";
  if (group === "recreational") return "Recreational";
  return "Vape Store";
}

const VAPESTORE_SECTIONS: Record<string, string> = {
  "vape-kits": "Kits & Devices",
  "pod-vape-kits": "Kits & Devices",
  "vape-tanks": "Pods, Tanks & Coils",
  coils: "Pods, Tanks & Coils",
  "refillable-pods": "Pods, Tanks & Coils",
  "prefilled-pods": "Pods, Tanks & Coils",
  "e-liquid": "E-Liquids",
  "nicotine-pouches": "Nicotine Alternatives",
  "nicotine-gum": "Nicotine Alternatives",
  "vape-accessories": "Accessories",
};

// ── Flat-array product shape (WooCommerce sites: streetcocaineshop + dmt) ─────
interface FlatImage {
  url: string;
  alt?: string;
  local?: string | null;
  webp_local?: string | null;
}

interface FlatProduct {
  slug: string;
  name?: string;
  site?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  price_range?: string;
  available?: boolean;
  vendor?: string;
  tags?: string[];
  description?: string;
  description_html?: string;
  short_description?: string;
  images?: FlatImage[];
  variants?: ShopVariant[];
  collections?: string[];
  source_url?: string;
  scraped_at?: string;
}

function isFlatProduct(raw: unknown): raw is FlatProduct {
  return (
    Boolean(raw) &&
    typeof raw === "object" &&
    !("title" in (raw as object)) &&
    "name" in (raw as object)
  );
}

export interface ShopVariant {
  id?: number;
  title?: string;
  sku?: string;
  price?: number;
  available?: boolean;
}

export interface ShopOption {
  name: string;
  position: number;
  values: string[];
}

export interface ShopProduct extends CatalogItem {
  description_html?: string;
  collections?: string[];
  variants?: ShopVariant[];
  options?: ShopOption[];
}

export interface ShopCategory {
  slug: string;
  label: string;
  site: string;
  group: CategoryGroup;
  section?: string;
  source?: string;
  count: number;
  images: number;
  coverFile?: string;
  updatedAt?: string;
}

interface WeedmapsImage {
  url: string;
  alt?: string;
  local?: string;
  webp_local?: string;
}

interface WeedmapsProduct {
  slug: string;
  name?: string;
  site?: string;
  category: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  price_range?: string;
  available?: boolean;
  vendor?: string;
  tags?: string[];
  description?: string;
  description_html?: string;
  short_description?: string;
  images?: WeedmapsImage[];
  variants?: ShopVariant[];
  collections?: string[];
  source_url?: string;
  scraped_at?: string;
}

function baseName(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i >= 0 ? p.slice(i + 1) : p;
}

// Product routes are slug-only, so the same slug from different sources would
// collide (duplicate React keys, ambiguous detail pages). Keep the first.
function dedupeBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

function prettyCategorySlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function flatImages(images: FlatImage[] | undefined): CatalogImage[] {
  return (images ?? [])
    .filter((im) => im.local != null || im.webp_local != null || im.url)
    .map((im, i) => ({
      file: baseName(im.webp_local ?? im.local ?? im.url),
      url: im.url,
      position: i + 1,
      downloaded: Boolean(im.webp_local ?? im.local),
    }));
}

function normalizeFlat(raw: FlatProduct, category: string): CatalogItem {
  return {
    site: raw.site ?? "unknown",
    category,
    id: raw.slug,
    slug: raw.slug,
    title: raw.name ?? raw.slug,
    url: raw.source_url ?? "#",
    brand: raw.vendor,
    price:
      raw.price_min === undefined && raw.price_max === undefined
        ? undefined
        : {
            min: raw.price_min ?? raw.price_max ?? 0,
            max: raw.price_max ?? raw.price_min ?? 0,
            currency: raw.currency ?? "USD",
          },
    description: (raw.description_html || raw.description || "").replace(/<[^>]+>/g, ""),
    tags: raw.tags ?? [],
    images: flatImages(raw.images),
    scrapedAt: raw.scraped_at ?? "",
  };
}

function normalizeFlatDetail(raw: FlatProduct, category: string): ShopProduct {
  const base = normalizeFlat(raw, category);
  return {
    ...base,
    description_html: raw.description_html,
    collections: raw.collections,
    variants: (raw.variants ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      available: v.available,
    })),
  };
}

// Generic item/detail normalizers: pass through already-normalised catalog items
// (vapestore), otherwise adapt flat WooCommerce products.
function normalizeItem(raw: unknown, category: string): CatalogItem {
  if (isFlatProduct(raw)) return normalizeFlat(raw, category);
  return raw as CatalogItem;
}

function normalizeDetail(raw: unknown, category: string): ShopProduct {
  if (isFlatProduct(raw)) return normalizeFlatDetail(raw, category);
  return raw as ShopProduct;
}

// ── weedmaps helpers ─────────────────────────────────────────────────────────
async function readWeedmapsIndex(): Promise<WeedmapsProduct[]> {
  const data = await readJsonCached(path.join(METADATA_DIR, WM_SITE, "index.json"));
  return Array.isArray(data) ? (data as WeedmapsProduct[]) : [];
}

function normalizeWeedmaps(p: WeedmapsProduct, category: string): CatalogItem {
  const images: CatalogImage[] = (p.images ?? []).map((im, i) => ({
    file: baseName(im.webp_local ?? im.local ?? im.url),
    url: im.url,
    position: i + 1,
    downloaded: Boolean(im.webp_local ?? im.local),
  }));
  return {
    site: WM_SITE,
    category,
    id: p.slug,
    slug: p.slug,
    title: p.name ?? p.slug,
    url: p.source_url ?? `https://weedmaps.com/search?q=${encodeURIComponent(p.slug)}`,
    brand: p.vendor,
    price:
      p.price_min === undefined && p.price_max === undefined
        ? undefined
        : {
            min: p.price_min ?? p.price_max ?? 0,
            max: p.price_max ?? p.price_min ?? 0,
            currency: p.currency ?? "USD",
          },
    description: (p.description_html || p.description || "").replace(/<[^>]+>/g, ""),
    tags: p.tags ?? [],
    images,
    scrapedAt: p.scraped_at ?? "",
  };
}

function normalizeWeedmapsDetail(p: WeedmapsProduct, category: string): ShopProduct {
  const base = normalizeWeedmaps(p, category);
  return {
    ...base,
    description_html: p.description_html,
    collections: p.collections,
    variants: p.variants ?? [],
  };
}

// ── Flat sources (streetcocaineshop + dmtshopping + shoppuff + disposable shops) ───────────
async function readFlatIndex(site: string): Promise<FlatProduct[]> {
  const data = await readJsonCached(path.join(METADATA_DIR, site, "index.json"));
  return Array.isArray(data) ? (data as FlatProduct[]) : [];
}

async function readDrugProducts(): Promise<FlatProduct[]> {
  const [scs, dmt, k2] = await Promise.all([
    readFlatIndex(SCS_SITE),
    readFlatIndex(DMT_SITE),
    readFlatIndex(K2_SITE),
  ]);
  // The same slug can appear on several sources, but product routes are
  // slug-only, so collapse duplicates and keep the first (SCS → DMT → K2),
  // matching the source order used by getShopProduct.
  return dedupeBySlug([...scs, ...dmt, ...k2]);
}

async function readShoppuffProducts(): Promise<FlatProduct[]> {
  return readFlatIndex(SHOPPUFF_SITE);
}

async function readOchoProducts(): Promise<FlatProduct[]> {
  return readFlatIndex(OCHO_SITE);
}

async function readDisposablesProducts(): Promise<FlatProduct[]> {
  const [besos, madlabs, caliclear, hitz] = await Promise.all([
    readFlatIndex(BESOS_SITE),
    readFlatIndex(MADLABS_SITE),
    readFlatIndex(CALICLEAR_SITE),
    readFlatIndex(HITZ_SITE),
  ]);
  // Deduplicate across these sites by slug (product routes are slug-only)
  return dedupeBySlug([...besos, ...madlabs, ...caliclear, ...hitz]);
}

/**
 * Maps the shoppuff + ocho (hemp/THC) flat sources onto unified category slugs.
 * Shoppuff items carry their source category; prerolls are re-tagged from the
 * PRE_ROLLS collection; ocho prerolls are detected by name.
 */
function classifyExtras(p: FlatProduct): FlatProduct | null {
  const hay = `${p.name ?? ""} ${(p.collections ?? []).join(" ")} ${p.category ?? ""} ${p.vendor ?? ""}`.toLowerCase();
  if (p.site === OCHO_SITE && /swag|hoodie|sweatshirt|beanie|socks|\bshirt\b|\bhat\b|\bcap\b|\btee\b/.test(hay))
    return null;
  if ((p.collections ?? []).some((c) => c === "PRE_ROLLS")) return { ...p, category: "prerolls" };
  if (p.site !== OCHO_SITE) return p;
  if (/preroll|pre-roll|\bjoint\b|\bblunt\b|\bdoink\b|hash hole/.test(hay)) return { ...p, category: "prerolls" };
  if (/infused|hash hole|infused donut|donut joint/.test(hay)) return { ...p, category: "infused-flower" };
  return { ...p, category: "cannabinoids" };
}

function classifyDisposables(p: FlatProduct): FlatProduct {
  const hay = `${p.name ?? ""} ${(p.collections ?? []).join(" ")} ${p.category ?? ""}`.toLowerCase();
  if (/pod|cartridge|cart/.test(hay)) return { ...p, category: "prefilled-pods" };
  if (/coil/.test(hay)) return { ...p, category: "coils" };
  if (/tank/.test(hay)) return { ...p, category: "vape-tanks" };
  if (/mod|kit|device|starter/.test(hay)) return { ...p, category: "vape-kits" };
  if (/liquid|juice|e-juice|salt|nicotine/.test(hay) && !/pouch|gum/.test(hay)) return { ...p, category: "e-liquid" };
  if (/pouch/.test(hay)) return { ...p, category: "nicotine-pouches" };
  if (/gum|strip/.test(hay)) return { ...p, category: "nicotine-gum" };
  if (/accessor/.test(hay)) return { ...p, category: "vape-accessories" };
  // Default: treat as disposable/prefilled style vapes -> prefilled-pods or vape-kits as fallback
  if (/(?:disposable|hitz|besos|mad\s*labs|cali\s*clear)/.test(hay)) {
    // If it says 'kit' or 'device' -> kits else prefilled-pods/disposables bucketed as prefilled-pods? or vape-kits? but unified has prefilled-pods; map to prefilled-pods is common
    if (/kit|device/.test(hay)) return { ...p, category: "vape-kits" };
    return { ...p, category: "prefilled-pods" };
  }
  return { ...p, category: "prefilled-pods" };
}

/** combined shoppuff + ocho extras with unified category fields */
async function readExtrasProducts(): Promise<FlatProduct[]> {
  const [shoppuff, ocho] = await Promise.all([readShoppuffProducts(), readOchoProducts()]);
  const extras: FlatProduct[] = [];
  for (const p of [...shoppuff, ...ocho]) {
    const mapped = classifyExtras(p);
    if (mapped) extras.push(mapped);
  }
  return extras;
}

/** unified category slugs that also collect products from the shoppuff menu */
const SHOPPUFF_CATEGORIES = new Set([
  "buds",
  "infused-flower",
  "prerolls",
  "cannabinoids",
  "vape-accessories",
]);

// ── Keyword classifier for the drug sources ──────────────────────────────────
export interface DrugBucketDef {
  bucket: string;
  label: string;
  section: string;
  patterns: RegExp[];
}

// Order matters: the first matching bucket wins.
export const DRUG_BUCKETS: DrugBucketDef[] = [
  {
    bucket: "cocaine",
    label: "Cocaine",
    section: "Stimulants",
    patterns: [
      /\bcocaine\b|\bcoke\b|\bcrack\b|fish[- ]?scale|\bflake\b|bolivian|colombian|peruvian|lavada|volkswagen/,
    ],
  },
  {
    bucket: "opioids",
    label: "Opioids",
    section: "Depressants",
    patterns: [
      /\bheroin\b|black tar|brown powder|\boxycodone\b|\boxycontin\b|\bpercocet\b|\bhydrocodone\b|hydromorphone|\brox[iy]codone\b|\bfentanyl\b|\bopium\b|morphine|\bcodeine\b|promethazine|\blean\b|wock|tris\b|\btris[- ]|\bquagen\b|toseina|nembutal|pentobarbital|\bperc\b|\bdilaudid\b|\bopana\b|\btramadol\b|nitazene|etazene|tonitazene|carfentanil|\bmgp\b|lenazine|painagon|astra pain/,
    ],
  },
  {
    bucket: "benzodiazepines",
    label: "Benzodiazepines",
    section: "Depressants",
    patterns: [
      /xanax|alprazolam|valium|diazepam|clonazolam|bromazolam|diclazepam|etizolam|trankimazin|farmapram|\bklonopin\b|clonazepam|\bbenzo\b|midazolam|lorazepam|nitrazepam|flualprazolam|flubromazolam|temazepam/,
    ],
  },
  {
    bucket: "lsd",
    label: "LSD",
    section: "Psychedelics",
    patterns: [
      /\blsd\b|\b1p-lsd\b|\b1b-lsd\b|ald-52|ald 52|blotter|gel tab|albert einstein|willy wonka|alice in wonderland|orange sunshine|sailor moon|smoking panther|\bwinnie\b|\bwindowpane\b/,
    ],
  },
  {
    bucket: "dmt",
    label: "DMT",
    section: "Psychedelics",
    patterns: [
      /\bdmt\b|nn-dmt|n,n-dmt|dimethyltryptamine|5-meo|5meo|ayahuasca|changa|mimosa|4-aco-dmt|5-bromo|\bdeems\b/,
    ],
  },
  {
    bucket: "mushrooms",
    label: "Mushrooms",
    section: "Psychedelics",
    patterns: [
      /psilocybin|psilocybe|mushroom|shroom|\bspore\b|penis envy|golden teacher|blue meanie|tidal wave|burmese|amazonian|king dong|texas yellow|ecuadorian|\bb\+\b|albino|monster penis|daddy long legs|\bmagic\b|neurogenesis|\benvy\b/,
    ],
  },
  {
    bucket: "mdma",
    label: "MDMA & Ecstasy",
    section: "Stimulants",
    patterns: [
      /\bmdma\b|\bmda\b|ecstasy|\bmolly\b|methylone|mephedrone|\b4-mmc\b|\bmdmc\b|bk-mdma|\bmdai\b|\bskype\b|supernova|punisher|rolls[ -]?royce|\btesla\b/,
    ],
  },
  {
    bucket: "stimulants",
    label: "Stimulants",
    section: "Stimulants",
    patterns: [
      /\bmeth\b|methamphetamine|crystal meth|methylamine|\bspeed\b|amphetamine|adderall|\b2-fma\b|\b2-fa\b|\b4f-mph\b|\ba-pvp\b|ephedrine|ethylmethcathinone|\b4-emc\b|\bkhat\b|khatmi|ritalin|methylphenidate|\bmdpv\b|\ba-php\b|ethylphenidate|\bnmc\b/,
    ],
  },
  {
    bucket: "dissociatives",
    label: "Dissociatives",
    section: "Dissociatives",
    patterns: [
      /ketamine|\bket\b|\bmxe\b|methoxetamine|ketaset|ketalar|\bpcp\b|phencyclidine|3-meo|\bdxm\b|dextromethorphan|dextrethorphan|nitrous/,
    ],
  },
  {
    bucket: "ghb",
    label: "GHB & GBL",
    section: "Depressants",
    patterns: [/gamma[- ]?hydroxybutyric|gamma[- ]?butyrolactone|\bghb\b|\bgbl\b/],
  },
  {
    bucket: "cannabinoids",
    label: "Cannabinoids & THC",
    section: "Cannabinoids",
    patterns: [
      /\bthc\b|delta[- ]?8|delta[- ]?9|\bd8\b|\bd9\b|\bk2\b|spice|hash|live resin|distillate|cannabis|cannabinoid|indica|sativa|hybrid|\bchocolate\b|moon[- ]?(chocolate|bar)|\bedible\b|\bcbd\b|\bweed\b|fubinaca|\bdank\b|mungus|lost farm|moonwlkr|\bdisposable\b|\bchew\b|\bmdmb\b|infused paper/,
    ],
  },
  {
    bucket: "other",
    label: "Research Chemicals",
    section: "Other",
    patterns: [],
  },
];

const DRUG_CATEGORY_ORDER = [
  "cocaine",
  "mdma",
  "stimulants",
  "opioids",
  "benzodiazepines",
  "ghb",
  "lsd",
  "dmt",
  "mushrooms",
  "dissociatives",
  "cannabinoids",
  "other",
];

function classifyDrug(p: FlatProduct): string {
  // The product name is authoritative; tags on these sources are SEO keyword
  // spam (e.g. a DMT cart tagged "DMT / LSD"), so only consult them if the
  // name alone is inconclusive.
  const name = (p.name ?? "").toLowerCase();
  for (const bucket of DRUG_BUCKETS) {
    if (bucket.patterns.some((re) => re.test(name))) return bucket.bucket;
  }
  const tags = (p.tags ?? []).join(" ").toLowerCase();
  for (const bucket of DRUG_BUCKETS) {
    if (bucket.patterns.some((re) => re.test(tags))) return bucket.bucket;
  }
  return "other";
}

// ── Taxonomy definition ──────────────────────────────────────────────────────
type SourceRef =
  | { kind: "vapestore"; category: string }
  | { kind: "weedmaps"; category: string }
  | { kind: "drugs"; bucket: string };

interface UnifiedCategoryDef {
  slug: string;
  label: string;
  group: CategoryGroup;
  section: string;
  source: SourceRef;
}

export const VAPE_CATEGORIES: Array<[string, string]> = [
  ["vape-kits", "Vape Kits"],
  ["pod-vape-kits", "Pod Vape Kits"],
  ["vape-tanks", "Vape Tanks"],
  ["coils", "Coils"],
  ["refillable-pods", "Refillable Pods"],
  ["prefilled-pods", "Prefilled Pods"],
  ["e-liquid", "E-Liquid"],
  ["nicotine-pouches", "Nicotine Pouches"],
  ["nicotine-gum", "Nicotine Gum & Strips"],
  ["vape-accessories", "Vape Accessories"],
];

const CANNABIS_CATEGORIES: Array<[string, string]> = [
  ["buds", "Buds"],
  ["infused-flower", "Infused Flower"],
  ["prerolls", "Prerolls"],
];

const UNIFIED_CATEGORIES: UnifiedCategoryDef[] = [
  ...VAPE_CATEGORIES.map(
    ([category, label]): UnifiedCategoryDef => ({
      slug: category,
      label,
      group: "vapes",
      section: VAPESTORE_SECTIONS[category] ?? "Vape Store",
      source: { kind: "vapestore", category },
    })
  ),
  ...CANNABIS_CATEGORIES.map(
    ([category, label]): UnifiedCategoryDef => ({
      slug: category,
      label,
      group: "cannabis",
      section: "Cannabis",
      source: { kind: "weedmaps", category },
    })
  ),
  ...DRUG_CATEGORY_ORDER.map((bucket) => {
    const def = DRUG_BUCKETS.find((b) => b.bucket === bucket)!;
    return {
      slug: def.bucket,
      label: def.label,
      group: "recreational" as const,
      section: def.section,
      source: { kind: "drugs" as const, bucket: def.bucket },
    };
  }),
];

export function categoryLabel(slug: string): string {
  return UNIFIED_CATEGORIES.find((c) => c.slug === slug)?.label ?? prettyCategorySlug(slug);
}

export async function getCategories(): Promise<ShopCategory[]> {
  const [root, weedmaps, drugs, extras, disposables] = await Promise.all([
    readRootIndex(),
    readWeedmapsIndex(),
    readDrugProducts(),
    readExtrasProducts(),
    readDisposablesProducts(),
  ]);
  const rootByCat = new Map((root?.categories ?? []).map((c) => [c.category, c]));
  const out: ShopCategory[] = [];

  const extraCover = (p: FlatProduct | undefined): string | undefined => {
    const im = p?.images?.[0];
    return im ? baseName(im.webp_local ?? im.local ?? im.url) : undefined;
  };

  const extraSites = (extra: FlatProduct[]): string =>
    [...new Set(extra.map((p) => p.site).filter(Boolean))].join(" / ");

  const disposablesMapped = disposables.map((p) => classifyDisposables(p));

  for (const def of UNIFIED_CATEGORIES) {
    const src = def.source;
    const extra = SHOPPUFF_CATEGORIES.has(def.slug)
      ? extras.filter((p) => p.category === def.slug)
      : [];
    const disp = def.group === "vapes" ? disposablesMapped.filter((p) => p.category === def.slug) : [];

    if (src.kind === "vapestore") {
      const meta = rootByCat.get(src.category);
      const index = await readCategoryIndex(src.category);
      let coverFile: string | undefined;
      const first = index?.items?.[0];
      if (first) {
        const item = await readItem(src.category, first.slug);
        coverFile = item ? normalizeItem(item, def.slug).images?.[0]?.file : undefined;
      }
      const count = (meta?.count ?? index?.items?.length ?? 0) + extra.length + disp.length;
      if (!count) continue;
      const sites = [
        meta?.site ?? "vapestore",
        extra.length ? extraSites(extra) : null,
        disp.length ? extraSites(disp) : null,
      ].filter(Boolean).join(" / ");
      out.push({
        slug: def.slug,
        label: def.label,
        site: sites,
        group: def.group,
        section: def.section,
        source: meta?.source,
        count,
        images:
          (meta?.images ?? 0) +
          extra.reduce((n, p) => n + (p.images?.length ?? 0), 0) +
          disp.reduce((n, p) => n + (p.images?.length ?? 0), 0),
        coverFile: coverFile ?? extraCover(extra[0]) ?? extraCover(disp[0]),
        updatedAt: meta?.scrapedAt ?? disp[0]?.scraped_at ?? extra[0]?.scraped_at,
      });
    } else if (src.kind === "weedmaps") {
      const products = weedmaps.filter((p) => p.category === src.category);
      if (!products.length && !extra.length) continue;
      const img = products[0]?.images?.[0];
      const site = products.length
        ? extra.length
          ? `${WM_SITE} / ${extraSites(extra)}`
          : WM_SITE
        : extraSites(extra);
      out.push({
        slug: def.slug,
        label: def.label,
        site,
        group: def.group,
        section: def.section,
        count: products.length + extra.length,
        images:
          products.reduce((n, p) => n + (p.images?.length ?? 0), 0) +
          extra.reduce((n, p) => n + (p.images?.length ?? 0), 0),
        coverFile: img ? baseName(img.webp_local ?? img.local ?? img.url) : extraCover(extra[0]),
        updatedAt: products[0]?.scraped_at ?? extra[0]?.scraped_at,
      });
    } else {
      const products = drugs.filter((p) => classifyDrug(p) === src.bucket);
      if (!products.length && !extra.length) continue;
      const img = products[0]?.images?.[0];
      out.push({
        slug: def.slug,
        label: def.label,
        site: extra.length ? `${SCS_SITE} / ${DMT_SITE} / ${K2_SITE} / ${extraSites(extra)}` : `${SCS_SITE} / ${DMT_SITE} / ${K2_SITE}`,
        group: def.group,
        section: def.section,
        count: products.length + extra.length,
        images:
          products.reduce((n, p) => n + (p.images?.length ?? 0), 0) +
          extra.reduce((n, p) => n + (p.images?.length ?? 0), 0),
        coverFile: img ? baseName(img.webp_local ?? img.local ?? img.url) : extraCover(extra[0]),
        updatedAt: products[0]?.scraped_at ?? extra[0]?.scraped_at,
      });
    }
  }

  return out;
}

export interface CategoryPage {
  slug: string;
  label: string;
  site: string;
  group: CategoryGroup;
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  items: CatalogItem[];
}

export async function getCategory(
  category: string,
  page = 1,
  pageSize = 24
): Promise<CategoryPage | null> {
  const def = UNIFIED_CATEGORIES.find((c) => c.slug === category);
  if (!def) return null;

  const clampPage = (p: number, pages: number) => Math.min(Math.max(1, p), Math.max(1, pages));
  const src = def.source;

  let pool: CatalogItem[] = [];
  let baseSite: string;

  if (src.kind === "vapestore") {
    const index = await readCategoryIndex(src.category);
    const entries = index?.items ?? [];
    const items = (await Promise.all(entries.map((e) => readItem(src.category, e.slug))))
      .filter((i): i is CatalogItem => Boolean(i))
      .map((i) => normalizeItem(i, def.slug));
    pool = items;
    baseSite = index?.site ?? "vapestore";
  } else if (src.kind === "weedmaps") {
    const wmPool = (await readWeedmapsIndex()).filter((p) => p.category === src.category);
    pool = wmPool.map((p) => normalizeWeedmaps(p, def.slug));
    baseSite = wmPool.length ? WM_SITE : "";
  } else {
    pool = (await readDrugProducts())
      .filter((p) => classifyDrug(p) === src.bucket)
      .map((p) => normalizeFlat(p, def.slug));
    baseSite = `${SCS_SITE} / ${DMT_SITE} / ${K2_SITE}`;
  }

  if (SHOPPUFF_CATEGORIES.has(def.slug)) {
    const extra = (await readExtrasProducts()).filter((p) => p.category === def.slug);
    if (extra.length) {
      pool = [...pool, ...extra.map((p) => normalizeFlat(p, def.slug))];
      const extraSites = [...new Set(extra.map((p) => p.site).filter(Boolean))].join(" / ");
      baseSite = [baseSite, extraSites].filter(Boolean).join(" / ");
    }
  }

  if (def.group === "vapes") {
    const disposables = (await readDisposablesProducts()).map((p) => classifyDisposables(p)).filter((p) => p.category === def.slug);
    if (disposables.length) {
      pool = [...pool, ...disposables.map((p) => normalizeFlat(p, def.slug))];
      const dispSites = [...new Set(disposables.map((p) => p.site).filter(Boolean))].join(" / ");
      baseSite = [baseSite, dispSites].filter(Boolean).join(" / ");
    }
  }

  if (!pool.length) return null;
  pool = dedupeBySlug(pool);
  const total = pool.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = clampPage(page, pages);
  const start = (current - 1) * pageSize;
  return {
    slug: def.slug,
    label: def.label,
    site: baseSite,
    group: def.group,
    total,
    page: current,
    pageSize,
    pages,
    items: pool.slice(start, start + pageSize),
  };
}

export interface ShowcaseProduct {
  slug: string;
  category: string;
  title: string;
  brand: string;
  href: string;
  price: { min: number; max: number; currency: string } | null;
  image: { file: string; width?: number; height?: number } | null;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Samples a handful of random products from *every* unified category, then
 * shuffles the combined list so the homepage mixes vapes, cannabis and
 * recreational products together.
 */
export async function getShowcaseProducts(perCategory = 5): Promise<ShowcaseProduct[]> {
  const categories = await getCategories();
  const [weedmaps, drugs, extras] = await Promise.all([
    readWeedmapsIndex(),
    readDrugProducts(),
    readExtrasProducts(),
  ]);

  const toShowcase = (item: CatalogItem, category: string): ShowcaseProduct => {
    const image = item.images?.[0];
    return {
      slug: item.slug,
      category,
      title: item.title,
      brand: item.brand ?? "",
      href: `/shop/${category}/${item.slug}`,
      price: item.price ? { min: item.price.min, max: item.price.max, currency: item.price.currency } : null,
      image: image
        ? { file: image.file, width: image.width, height: image.height }
        : null,
    };
  };

  const batches = await Promise.all(
    categories.map(async (cat): Promise<ShowcaseProduct[]> => {
      const def = UNIFIED_CATEGORIES.find((c) => c.slug === cat.slug);
      if (!def) return [];
      const src = def.source;
      let pool: CatalogItem[] = [];

      if (src.kind === "vapestore") {
        const index = await readCategoryIndex(src.category);
        const entries = shuffle(index?.items ?? []).slice(0, perCategory);
        pool = (
          await Promise.all(entries.map((e) => readItem(src.category, e.slug)))
        )
          .filter((i): i is CatalogItem => Boolean(i))
          .map((i) => normalizeItem(i, def.slug));

        if (SHOPPUFF_CATEGORIES.has(def.slug)) {
          const extra = shuffle(extras.filter((p) => p.category === def.slug));
          pool = [...pool, ...extra.map((p) => normalizeFlat(p, def.slug))];
        }
      } else if (src.kind === "weedmaps") {
        pool = shuffle(weedmaps.filter((p) => p.category === src.category)).map((p) =>
          normalizeWeedmaps(p, def.slug)
        );
      } else {
        pool = shuffle(drugs.filter((p) => classifyDrug(p) === src.bucket)).map((p) =>
          normalizeFlat(p, def.slug)
        );
      }

      return shuffle(dedupeBySlug(pool)).slice(0, perCategory).map((item) => toShowcase(item, def.slug));
    })
  );

  return shuffle(batches.flat());
}

export async function getShopProduct(
  category: string,
  slug: string
): Promise<ShopProduct | null> {
  const def = UNIFIED_CATEGORIES.find((c) => c.slug === category);
  if (!def) return null;
  const src = def.source;

  if (src.kind === "vapestore") {
    try {
      const raw = await fs.readJson(path.join(METADATA_DIR, src.category, `${slug}.json`));
      return normalizeDetail(raw, def.slug);
    } catch {
      // not a vapestore item — fall through to the flat sources
    }
  }

  if (src.kind === "weedmaps") {
    try {
      const raw = (await fs.readJson(
        path.join(METADATA_DIR, WM_SITE, "products", `${slug}.json`)
      )) as WeedmapsProduct;
      return normalizeWeedmapsDetail(raw, def.slug);
    } catch {
      // not a weedmaps item — fall through to the flat sources
    }
  }

  for (const site of [SCS_SITE, DMT_SITE, K2_SITE, OCHO_SITE, SHOPPUFF_SITE, BESOS_SITE, MADLABS_SITE, CALICLEAR_SITE, HITZ_SITE]) {
    try {
      const raw = (await fs.readJson(
        path.join(METADATA_DIR, site, "products", `${slug}.json`)
      )) as FlatProduct;
      return normalizeFlatDetail(raw, def.slug);
    } catch {
      // try next source
    }
  }
  return null;
}

// ── Navigation ───────────────────────────────────────────────────────────────
export interface NavProductLink {
  href: string;
  title: string;
}

export interface NavSectionData {
  label: string;
  href: string;
  total: number;
  products: NavProductLink[];
}

// A dropdown only needs a representative slice; sections can hold thousands of
// products (e.g. 9k cannabinoids), so cap the preview and link to the rest.
const NAV_PRODUCT_LIMIT = 30;

/**
 * Builds the centred desktop navigation from the same taxonomy the /shop page
 * and mobile menu use: every scraped category, grouped under its section. The
 * top level lists section types (Kits & Devices, E-Liquids, Cannabis,
 * Psychedelics, …) and each dropdown lists products under that section — no
 * sub-category level.
 */
export async function getNavSections(): Promise<NavSectionData[]> {
  const [root, weedmaps, drugs, extras] = await Promise.all([
    readRootIndex(),
    readWeedmapsIndex(),
    readDrugProducts(),
    readExtrasProducts(),
  ]);
  const rootByCat = new Map((root?.categories ?? []).map((c) => [c.category, c]));

  const vapeIndexes = new Map<string, IndexEntry[]>();
  await Promise.all(
    VAPE_CATEGORIES.map(async ([category]) => {
      const index = await readCategoryIndex(category);
      vapeIndexes.set(category, index?.items ?? []);
    })
  );

  const linkFor = (def: UnifiedCategoryDef, slug: string, title: string): NavProductLink => ({
    href: `/shop/${def.slug}/${slug}`,
    title,
  });

  const productsFor = (def: UnifiedCategoryDef): NavProductLink[] => {
    const src = def.source;
    const out: NavProductLink[] = [];
    if (src.kind === "vapestore") {
      for (const e of vapeIndexes.get(src.category) ?? []) {
        out.push(linkFor(def, e.slug, e.title));
      }
    } else if (src.kind === "weedmaps") {
      for (const p of weedmaps) {
        if (p.category === src.category) out.push(linkFor(def, p.slug, p.name ?? p.slug));
      }
    } else {
      for (const p of drugs) {
        if (classifyDrug(p) === src.bucket) out.push(linkFor(def, p.slug, p.name ?? p.slug));
      }
    }
    for (const p of extras) {
      if (p.category === def.slug) out.push(linkFor(def, p.slug, p.name ?? p.slug));
    }
    // The same slug can exist on multiple scraped sources, which yields
    // identical hrefs. Keep the first occurrence so React keys stay unique.
    const seen = new Set<string>();
    return out.filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
  };

  const countFor = (def: UnifiedCategoryDef): number => {
    const src = def.source;
    const extra = extras.reduce((n, p) => n + (p.category === def.slug ? 1 : 0), 0);
    if (src.kind === "vapestore") {
      const meta = rootByCat.get(src.category);
      return (meta?.count ?? vapeIndexes.get(src.category)?.length ?? 0) + extra;
    }
    if (src.kind === "weedmaps") {
      return weedmaps.reduce((n, p) => n + (p.category === src.category ? 1 : 0), 0) + extra;
    }
    return drugs.reduce((n, p) => n + (classifyDrug(p) === src.bucket ? 1 : 0), 0) + extra;
  };

  const sections: NavSectionData[] = [];
  for (const def of UNIFIED_CATEGORIES) {
    const total = countFor(def);
    if (!total) continue;
    let section = sections.find((s) => s.label === def.section);
    if (!section) {
      section = { label: def.section, href: `/shop/${def.slug}`, total: 0, products: [] };
      sections.push(section);
    }
    section.total += total;
    const room = NAV_PRODUCT_LIMIT - section.products.length;
    if (room > 0) section.products.push(...productsFor(def).slice(0, room));
  }

  return sections;
}
