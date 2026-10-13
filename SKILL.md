---
name: barek-aso
description: Write and optimise App Store and Google Play listing text (ASO and SEO): app name, subtitle, keyword field, promotional text, short and full description, What's New. Researches the live store first: who ranks for each search term, how crowded each keyword is, and how the top-ranking apps word their listings. Then drafts copy within every character limit and checks it. Use when the user asks for an app description, store listing, keywords, subtitle, ASO, app store SEO, "why don't we show up when people search X", or is preparing a store submission or localisation.
---

# Barek ASO

Store search is the cheapest install channel there is, and most of it is
decided by about 160 characters: the name, the subtitle (or Play short
description) and the keyword field. This skill researches what ranks, then
writes those characters, then the longer copy that converts the visit.

Two jobs, in order. Don't write a word before step 3.

1. **Research** what people search, who wins those searches today, and why.
2. **Write** the listing fields to the limits, then check them with a script.

`references/store-rules.md` has the limits and indexing rules for both stores.
Read it before drafting.

## Workflow

### 1. Know the app and the current listing

Read the app: what it does, who it's for, its strongest differentiator, its
price model. Find the existing listing text (often `store/`, `fastlane/metadata`,
`metadata/`, or ask). If there is a competitor study (for example
`docs/COMPETITORS.md` from `barek-competitor-watch`), read it: the words
customers use in reviews are the words they search with.

### 2. Build the candidate keyword list

Brainstorm 20–40 terms a customer would type, in their words, not yours:
the job ("date ideas"), the who ("couples", "boyfriend"), the situation
("long distance"), the format ("quiz", "widget"), and synonyms. Mine
competitor names and subtitles and review text for vocabulary. Include
misspellings only if they're common.

### 3. Research the store

```bash
scripts/appstore.mjs keywords "couples games,date ideas,long distance,relationship quiz" --app <your id>
scripts/appstore.mjs search "date ideas" --limit 10
scripts/appstore.mjs lookup <top ids> --out research/top-apps.json
```

`keywords` gives, per term: the app ranking #1, the median ratings count of
the top 10 (how entrenched the term is), how many of the top 10 carry the term
in their name (how much the name field matters for it), and your rank if you
pass `--app`.

Read it like this:

- **High median, term in most names**: a head term owned by big apps. Keep it in the keyword field for long-tail combinations, but don't build the name around it unless you're already big.
- **Low median, few name matches**: an opening. Put it in the name or subtitle.
- **You rank > 50**: Apple doesn't associate you with the term yet. Name/subtitle placement moves this most.

Then study the top 5 apps for your two or three most important terms: their
name and subtitle pattern (`Brand: Keyword Keyword`), what their description
opens with, their category, and how often they update. Subtitles aren't in the
API; read them on the store page (`https://apps.apple.com/<country>/app/id<id>`).
Note what every leader does (that's the price of entry) and what none of them
says (that's your angle).

Search results differ per storefront. Run the research with `--country` for
each market the user cares about.

### 4. Choose the keyword plan

Before drafting, show the user a short plan:

- **Name** (30): brand + the one or two highest-value terms you can credibly win.
- **Subtitle / short description**: the next terms, phrased as a benefit a human would read.
- **Keyword field** (Apple, 100 bytes): every remaining term, single words, comma-separated, no spaces, nothing already in the name or subtitle. Apple combines words across the three fields, so "long,distance" plus "couples" in the name can match "long distance couples".
- **Description** (Play indexes it; Apple doesn't): which 3–5 terms appear naturally 2–4 times each.

### 5. Write the fields

Draft every field in the store's limits (see the reference). Keep one Markdown
file per store and language, one `## Field` heading per field, so it can be
checked and versioned, e.g. `store/listing/en.md`, `store/listing/play-en.md`.

Description structure that converts (both stores):

1. **First 2–3 lines** (all most people see before "more"): what it is, who it's for, the outcome. No "Welcome to…".
2. **Short sections** with plain-caps or bold headers, each a benefit, 2–4 bullets of concrete features.
3. **Proof that's true**: awards, press, real user counts, only if the user supplies them.
4. **Pricing in one honest paragraph**: what's free, what Plus/Pro adds, that it renews, how to cancel. Required for subscriptions on both stores.
5. **Links**: privacy policy and terms (Apple requires the terms link for auto-renewing subscriptions).

Promotional text (Apple, 170) is not indexed and can be changed without a new
build: use it for the current hook or a seasonal message. What's New: lead
with the change a user will notice.

### 6. Check it

```bash
scripts/check-listing.mjs store/listing/en.md --targets "couples,date ideas,long distance" --competitors "Paired,Couple Joy"
scripts/check-listing.mjs store/listing/play-en.md --targets "couples,date ideas"
```

It fails on over-limit fields and competitor names, and warns on wasted
keyword bytes (spaces, repeats, words already in the name/subtitle, plural
pairs), banned title words (best, #1, top, free, new), emoji, all caps, and
target terms missing from or stuffed into the description. Fix every FAIL;
fix warnings unless there's a reason.

### 7. SEO beyond the store

Store pages are indexed by Google, and the app usually has a website:

- The store page's search snippet is the name, subtitle and first lines of the description. Write those first lines for a Google searcher too.
- The landing page's `<title>` and meta description should carry the same two or three head terms as the name and subtitle, worded for the web (≤ 60 and ≤ 155 characters).
- Use the same app name everywhere (store, site, socials) so search engines join them up.
- Add Apple's Smart App Banner and the Play badge link on the site; link the site from both listings.

### 8. Localise, don't translate

For each extra language, redo steps 2–3 in that storefront. People search in
their own words, and a literal translation of an English keyword list ranks
for nothing. Some storefronts index more than one localisation (the US store
also reads Spanish (Mexico)), which gives you a second keyword field there.

## Rules

- Never put a competitor's brand in any field, including keywords. It is a trademark violation and grounds for rejection (Apple guideline 2.3.7; Google Play metadata policy).
- Never claim rankings, awards, user counts or reviews the user hasn't given you.
- No price or ranking claims in titles ("free", "best", "#1", "top", "sale").
- The listing must describe the build being submitted. Don't advertise features that aren't shipped.
- Report what will and won't move rankings honestly: wording gets you considered for a term. Downloads, ratings and retention decide your position. Don't promise "#1".

## Pairs well with

- `barek-competitor-watch`: gives you the competitor set, the customer vocabulary and the edge to lead with.
- `appstore-screenshots`: the screenshots carry the same story as the description.
