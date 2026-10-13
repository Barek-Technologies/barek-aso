# Store listing rules

Limits and indexing as of late 2026. Confirm against App Store Connect and Play
Console when something doesn't fit; both stores change rules without notice.

## Apple App Store

| Field | Limit | Indexed for search | Notes |
| --- | --- | --- | --- |
| App name | 30 | Yes, strongest | Brand plus one or two terms. Must match the app's home-screen name closely. |
| Subtitle | 30 | Yes | Benefit phrasing. Shown under the name in search results. |
| Keywords | 100 bytes | Yes | Comma-separated, no spaces. Hidden from users. Non-ASCII letters take 2–3 bytes. |
| Promotional text | 170 | No | Editable any time without review. |
| Description | 4000 | No (Apple) / Yes (Google web) | Conversion only, for Apple search. |
| What's New | 4000 | No | Per version. |
| In-app purchase display names | 30 | Yes | Promoted IAPs can appear in search. |
| Developer name | | Yes | From the developer account. |

How Apple matches:

- Words in name, subtitle and keywords are combined, so you never need a word twice. Repeating a word in the keyword field that's already in the name wastes bytes.
- Apple matches simple plurals and some stems; don't spend bytes on both "game" and "games".
- "App", category names and your own brand name are already covered.
- Each localisation has its own name/subtitle/keywords. Some storefronts index two localisations (the US store reads English (US) and Spanish (Mexico)), so the second one is extra keyword space for that market.
- Rank is driven mostly by download velocity, conversion from the search result, ratings, and retention. Text gets you considered; behaviour decides the order.

Review guidelines that bite listings: 2.3.1 (accurate metadata), 2.3.7 (no
competitor names or irrelevant terms in metadata), 2.3.3/2.3.4 (screenshots and
previews show the real app), 3.1.2 (subscription terms stated clearly).

## Google Play

| Field | Limit | Indexed | Notes |
| --- | --- | --- | --- |
| Title | 30 | Yes, strongest | No emoji, all caps, or ranking/price claims. |
| Short description | 80 | Yes | Shown on the listing above the fold. |
| Full description | 4000 | Yes | There's no keyword field, so this does that job. Natural repetition of 3–5 terms; stuffing is penalised. |
| Developer name | | Yes | |

Play metadata policy forbids: performance or ranking claims ("#1", "best",
"top", "app of the year") unless attributed and current; price/promo words in
the title ("free", "sale", "discount"); emoji and special characters used for
attention; ALL CAPS unless part of the brand; unattributed user testimonials;
repetitive or irrelevant keywords; competitor names.

## Category

Pick the category where the people searching for you browse, then check who
is in it: `appstore.mjs top --genre <name>`. A smaller category can mean a
reachable chart position; a mismatched one costs relevance.
