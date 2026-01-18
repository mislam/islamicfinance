# Article view count

We count one view per person per article. Bots are excluded. The logic lives in `src/lib/server/view-count.ts`.

## How it works

1. **Bot check** — Skip known crawlers (User-Agent blocklist).
2. **Visitor ID (`vid`)** — Cookie, 1 year. First visit: create and set. Later: reuse. Main way we know “same person.”
3. **Fingerprint** — `hash(IP | User-Agent)`. Used only when `vid` is missing (e.g. user cleared cookies). Same IP + same browser → same fingerprint, so we can still avoid double-counting.
4. **Record** — Insert into `article_views` with `(visitorId, articleId, fingerprint)`. Two constraints:
   - **PK `(visitorId, articleId)`** — One row per visitor per article. Same `vid` + same article again → insert ignored.
   - **Unique `(articleId, fingerprint)`** — One row per fingerprint per article. New `vid` (cookie clear) but same fingerprint → insert ignored.
5. **Count** — If the insert succeeded, increment `articles.view_count`.

## What the fingerprint does

**Fingerprint = backup ID when the cookie is gone.** If someone clears cookies and returns, we don’t have `vid`, but same IP + same browser usually means same person. The `(articleId, fingerprint)` unique blocks a second insert, so we don’t count again.

| Situation                      | `vid` | Fingerprint | Result                           |
| ------------------------------ | ----- | ----------- | -------------------------------- |
| First visit                    | new   | new         | Count                            |
| Return, same browser           | same  | —           | No count (PK)                    |
| Cookie cleared, same IP+UA     | new   | same        | No count (unique on fingerprint) |
| New device / VPN / new browser | new   | new         | Count                            |

## Tables

- **`articles.view_count`** — Displayed total. Incremented only on first view per person.
- **`article_views`** — One row per `(visitor, article)` or per `(article, fingerprint)`. Used only for dedup; no retention/cleanup.

## Integration

- **Where:** `routes/articles/[slug]/+page.server.ts` → `recordArticleView({ articleId, slug, cookies, getClientAddress, request, secure })`.
- **Preload:** Article links use `data-sveltekit-preload-data="false"` so hover does not run `load` (and thus does not count). Count runs only on actual navigation.
