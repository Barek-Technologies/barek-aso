#!/usr/bin/env node
// Check a store listing written as Markdown, one "## Field" section per field:
//
//   ## Name            ## Title               (Apple: Name, Subtitle, Promotional text,
//   Loveclub: ...      Loveclub: ...           Keywords, Description, What's New)
//                                             (Play: Title, Short description,
//   ## Subtitle        ## Short description    Full description)
//   ...
//
// Anything after the field name on the heading line, like "(30)", is ignored.
//
//   check-listing.mjs listing.md [--store apple|play] [--targets "couples,date ideas"]
//                    [--competitors "Paired,Couple Joy"]
//
// Exits 1 when a hard store rule is broken (over a limit, competitor name),
// so it can sit in CI next to the listing files.

import { readFile } from "node:fs/promises";

const LIMITS = {
  apple: { name: 30, subtitle: 30, "promotional text": 170, keywords: 100, description: 4000, "what's new": 4000 },
  play: { title: 30, "short description": 80, "full description": 4000 },
};

// Words stores reject or demote in titles, and that read as spam anywhere.
const TITLE_BANNED = [/\bbest\b/i, /#\s?1\b/, /\btop\b/i, /\bfree\b/i, /\bnew\b/i, /\bsale\b/i, /\bdiscount\b/i];
const EMOJI = /\p{Extended_Pictographic}/u;
const STOP = new Set(["a", "an", "and", "the", "of", "for", "to", "in", "on", "with", "&", "your", "you", "my", "app"]);

function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) opt[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { pos, opt };
}

function sections(md) {
  const out = {};
  let key = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+([^(]+?)\s*(\(.*\))?\s*$/);
    if (h) { key = h[1].trim().toLowerCase(); out[key] = []; continue; }
    if (/^#\s/.test(line)) { key = null; continue; }
    if (key) out[key].push(line);
  }
  const ALIASES = { "app name": "title", "app title": "title", "long description": "full description" };
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [ALIASES[k] ?? k, v.join("\n").trim()]));
}

const words = (s) => (s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []).filter((w) => !STOP.has(w));
const singular = (w) => w.replace(/(ies)$/, "y").replace(/(?<!s)s$/, "");
const chars = (s) => [...s].length;

async function main() {
  const { pos, opt } = parseArgs(process.argv.slice(2));
  if (pos.length !== 1) {
    console.error('usage: check-listing.mjs listing.md [--store apple|play] [--targets "a,b"] [--competitors "X,Y"]');
    process.exit(64);
  }
  const f = sections(await readFile(pos[0], "utf8"));
  const store = opt.store ?? ("title" in f || "full description" in f ? "play" : "apple");
  const errors = [];
  const warns = [];
  const notes = [];

  for (const [field, limit] of Object.entries(LIMITS[store])) {
    if (!(field in f)) { warns.push(`missing field "${field}"`); continue; }
    const len = field === "keywords" ? Buffer.byteLength(f[field]) : chars(f[field]);
    const line = `${field}: ${len}/${limit}${field === "keywords" ? " bytes" : ""}`;
    if (len > limit) errors.push(`${line}, over by ${len - limit}`);
    else notes.push(len < limit * 0.8 && ["name", "subtitle", "keywords", "title", "short description"].includes(field)
      ? `${line} (unused space is unused ranking)` : line);
  }

  const title = f.name ?? f.title ?? "";
  for (const re of TITLE_BANNED) if (re.test(title)) warns.push(`title contains "${title.match(re)[0]}": stores reject or demote price/rank claims in titles`);
  for (const field of ["name", "title", "subtitle", "short description"]) {
    if (f[field] && EMOJI.test(f[field])) warns.push(`${field} has emoji: Play rejects it in titles, Apple usually does`);
    if (f[field] && f[field] === f[field].toUpperCase() && /[A-Z]{4}/.test(f[field])) warns.push(`${field} is all caps`);
  }

  if (store === "apple" && f.keywords != null) {
    const kw = f.keywords;
    if (/,\s/.test(kw)) warns.push("keywords: spaces after commas waste bytes");
    const terms = kw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const dupes = terms.filter((t, i) => terms.indexOf(t) !== i);
    if (dupes.length) warns.push(`keywords: repeated terms ${[...new Set(dupes)].join(", ")}`);
    const indexed = new Set([...words(title), ...words(f.subtitle ?? "")].map(singular));
    const wasted = [...new Set(terms.flatMap(words))].filter((w) => indexed.has(singular(w)));
    if (wasted.length) warns.push(`keywords repeat words already in the name/subtitle (Apple indexes those already): ${wasted.join(", ")}`);
    const plural = terms.filter((t) => terms.includes(t.replace(/s$/, "")) && t.endsWith("s"));
    if (plural.length) warns.push(`keywords: singular and plural both present (Apple matches both): ${plural.join(", ")}`);
    if (terms.some((t) => /\bapp\b/.test(t))) warns.push('keywords: "app" is implied; drop it');
  }

  if (opt.competitors) {
    for (const c of opt.competitors.split(",").map((s) => s.trim()).filter(Boolean)) {
      const re = new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      for (const [field, text] of Object.entries(f)) if (re.test(text)) errors.push(`${field} names competitor "${c}" (trademark; Apple 2.3.7, Play metadata policy)`);
    }
  }

  if (opt.targets) {
    // "long-distance" should count for "long distance".
    const body = (f["full description"] ?? f.description ?? "").toLowerCase().replace(/-/g, " ");
    const total = words(body).length || 1;
    console.log(`Target terms (${store === "play" ? "Play indexes the full description" : "Apple does not index the description; this is for conversion and web SEO"}):`);
    for (const t of opt.targets.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)) {
      const count = body.split(t).length - 1;
      const where = [
        title.toLowerCase().includes(t) && "title",
        (f.subtitle ?? f["short description"] ?? "").toLowerCase().includes(t) && (store === "play" ? "short" : "subtitle"),
        store === "apple" && (f.keywords ?? "").toLowerCase().split(",").some((k) => t.split(" ").every((w) => k.includes(w) || title.toLowerCase().includes(w) || (f.subtitle ?? "").toLowerCase().includes(w))) && "keywords",
      ].filter(Boolean);
      const density = ((count * t.split(" ").length) / total) * 100;
      const flag = count === 0 ? "  <- not in the description" : density > 3 ? "  <- reads as stuffing" : "";
      console.log(`  ${t.padEnd(24)} ${String(count).padStart(2)}× in description (${density.toFixed(1)}%)  ${where.join(", ") || "not in indexed fields"}${flag}`);
    }
    console.log("");
  }

  console.log(`${store === "play" ? "Google Play" : "App Store"} listing: ${pos[0]}`);
  for (const l of notes) console.log(`  ok    ${l}`);
  for (const l of warns) console.log(`  warn  ${l}`);
  for (const l of errors) console.log(`  FAIL  ${l}`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
