# Barek ASO

An agent skill for [Claude Code](https://claude.com/claude-code) (and any agent
that reads `SKILL.md` skills) that writes your App Store and Google Play
listing: app name, subtitle, keyword field, promotional text, short and full
description, What's New. It does the research first: it searches the live
store to see who ranks for each term, how crowded each keyword is, and how the
top-ranking apps word their listings. Then it writes within every limit and
checks the result with a script.

## What it does

1. **Reads your app and current listing** (and the competitor study, if you have one).
2. **Builds a keyword list** in your customers' words, including vocabulary mined from competitor reviews.
3. **Researches the store:** for each term, the #1 app, how entrenched the top 10 are, how many carry the term in their name, and your current rank.
4. **Plans placement:** which terms go in the name, the subtitle, the keyword field and the description, shown to you before any copy is written.
5. **Writes every field** for Apple and Google Play, one Markdown file per store and language.
6. **Checks it:** character limits, wasted keyword bytes, banned title words, competitor trademarks, keyword coverage and stuffing in the description.
7. **Covers SEO beyond the store:** the Google snippet of your store page, your landing page title and meta, consistent naming.
8. **Localises** by redoing the research per storefront instead of translating keywords.

Just ask: *"Write our App Store description"*, *"Why don't we show up for
'date ideas'?"*, *"Do an ASO pass for the Spanish listing"*, or run `/barek-aso`.

## Install

With npm (Node 18+), from your project folder:

```bash
npx github:Barek-Technologies/barek-aso                       # this project: ./.claude/skills/
npx github:Barek-Technologies/barek-aso --global              # every project: ~/.claude/skills/
npx github:Barek-Technologies/barek-aso --dir .agents/skills  # any other agent's skills folder
```

Run the same command again to update.

Or with the [skills CLI](https://www.npmjs.com/package/skills), or plain git:

```bash
npx skills add Barek-Technologies/barek-aso
git clone https://github.com/Barek-Technologies/barek-aso ~/.claude/skills/barek-aso
```

## The scripts

Node 18+, no dependencies, no API keys.

```bash
scripts/appstore.mjs keywords "couples games,date ideas,long distance" --app <your id>
scripts/appstore.mjs search "date ideas" --limit 10
scripts/check-listing.mjs store/listing/en.md --targets "couples,date ideas" --competitors "Paired,Couple Joy"
```

Example `keywords` output:

```
term           results  median top-10 ratings  top-10 w/ term in name  #1 today
couples games  49       9,355                  4                       Couples Games & Challenges
long distance  47       39,073                 3                       Couple Joy - Relationship App
date ideas     46       0                      8                       DateWay — Date Ideas
```

`check-listing.mjs` reads a Markdown listing with one `## Field` heading per
field (`## Name`, `## Subtitle`, `## Keywords`, `## Description`, or for Play
`## Title`, `## Short description`, `## Full description`), detects the store,
and exits 1 on a hard failure so you can run it in CI.

`references/store-rules.md` has the limits, indexing rules and review
guidelines for both stores.

## Honest limits

Wording gets you *considered* for a search term. Downloads, conversion,
ratings and retention decide where you rank. The skill won't promise "#1",
and it won't put competitor names or invented proof in your listing.

## More Barek skills

| Skill | What it does |
| --- | --- |
| [barek-competitor-watch](https://github.com/Barek-Technologies/barek-competitor-watch) | Competitor study and review mining → what to build next |
| [barek-aso](https://github.com/Barek-Technologies/barek-aso) | Store name, subtitle, keywords and descriptions, researched against what ranks |
| [appstore-screenshots](https://github.com/Barek-Technologies/appstore-screenshots) | Highest-converting screens, captioned and rendered at exact store sizes |
| [barek-landing](https://github.com/Barek-Technologies/barek-landing) | Calm app landing page: centred pill nav, gradient glow, one phone |

They share one research client (`scripts/appstore.mjs`) and hand off to each
other: the competitor study feeds the copy and the screenshot story.

## License

MIT © 2026 Barek Technologies Limited. See [LICENSE](LICENSE).
