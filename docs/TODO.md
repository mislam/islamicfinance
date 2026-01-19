# TODO

Tracking gaps and enhancements for the Islamic Finance site. Use this file to pick items to implement (e.g. "implement 1.1" or "add 2.3").

**See also:** [CODE_REVIEW.md](CODE_REVIEW.md) — Articles: what's implemented, code quality, security, performance. [SEO_REVIEW.md](SEO_REVIEW.md) — SEO audit and implementation details (BreadcrumbList, canonical, OG, etc.).

---

## 1. Critical / High-Impact

### 1.1 Global navigation (header)

- **Status:** [ ] Not started
- **What:** Root layout (`+layout.svelte`) only renders `{@render children()}`. No shared header.
- **Impact:** From `/articles`, `/articles/[slug]`, `/loan-agreement-generator` there is no link to Home, tools, or each other.
- **Recommendation:** Add a shared **header** in `+layout.svelte` with links: Home (`/`), Islamic Mortgage Calculator, Loan Agreement Generator, Articles (`/articles`).

### 1.2 Custom error pages

- **Status:** [ ] Not started
- **What:** No `+error.svelte`. 404/500 use SvelteKit's default (often unstyled).
- **Impact:** Poor UX and branding on errors.
- **Recommendation:** Add `src/routes/+error.svelte` (and optionally `+error@.svelte`) with simple copy, link to home, and existing styles.

### 1.3 Legal / trust pages

- **Status:** [ ] Not started
- **What:** No Privacy, Terms, About, or Contact.
- **Impact:** Cookies (`vid`), GA, and future auth make a privacy policy expected (GDPR/CCPA). Terms help for tools that generate legal docs. About/Contact help trust and support.
- **Recommendation:**
  - Add `/privacy` (and `/privacy-policy` redirect if desired).
  - Add `/terms` (or `/terms-of-service`).
  - Add `/about` (and optionally `/contact` or `#contact` on About).
  - Link all in a shared footer.

### 1.4 Auth: remove or enable

- **Status:** [ ] Not started
- **What:** Better Auth + Google is wired in code but **disabled** in `hooks.server.ts`.
- **Impact:** Unused auth adds maintenance; if you enable it later, you'll need handler + `/api/auth/[...]` and sign-in UI.
- **Recommendation:** Either remove auth-related code and schema if unused, or enable it in `hooks.server.ts`, add the auth API route, and minimal sign-in/sign-out UI and any protected routes.

---

## 2. Medium priority

### 2.1 Shared footer

- **Status:** [ ] Not started
- **What:** Mortgage calculator has its own footer (author/social); loan generator has none; home and articles have none.
- **Impact:** Inconsistent UX, duplicate credits, no single place for legal/About links.
- **Recommendation:** Add a shared **footer** in `+layout.svelte` (or `Footer.svelte`) with: site links, Privacy, Terms, About/Contact, credits. Reuse mortgage calculator credits there and remove its page-local footer.

### 2.2 "Home" / site-name link from subpages

- **Status:** [ ] Not started
- **What:** No "Islamic Finance" or "Home" link from `/articles`, `/articles/[slug]`, `/loan-agreement-generator`. Mortgage footer doesn't link to `/`.
- **Impact:** Users can't easily return to home.
- **Recommendation:** In the shared header, add site name/logo linking to `/` on every page.

### 2.3 Dynamic `robots.txt`

- **Status:** [ ] Not started
- **What:** `static/robots.txt` has `Sitemap: https://www.islamicfinance.app/sitemap.xml` hardcoded.
- **Impact:** Wrong for staging, other domains, localhost.
- **Recommendation:** Serve `robots.txt` from a `+server.ts` and set sitemap URL from `url.origin` (or `PUBLIC_CANONICAL_URL` / similar env).

### 2.4 RSS feed

- **Status:** [ ] Not started
- **What:** No `/articles/rss.xml` or `/rss.xml`.
- **Impact:** Less discoverability for article updates.
- **Recommendation:** Add `src/routes/rss.xml/+server.ts` or `src/routes/articles/rss.xml/+server.ts` with recent articles (title, link, description, dates). Optionally link in `<head>` or footer.

### 2.5 Breadcrumbs

- **Status:** [ ] Not started
- **What:** No breadcrumb UI or BreadcrumbList schema. [SEO_REVIEW.md](SEO_REVIEW.md) recommends it.
- **Impact:** Weaker navigation cues and SEO.
- **Recommendation:** Add breadcrumb (e.g. Home > Articles > [Article]) on article and articles index, plus BreadcrumbList JSON-LD.

---

## 3. Lower priority / enhancements

### 3.1 Search (remove placeholder or implement)

- **Status:** [ ] Not started
- **What:** Homepage has a `SearchAction` in WebSite schema pointing at `/islamic-mortgage-calculator`, which is not a search endpoint.
- **Impact:** Misleading for search engines; no real site search.
- **Recommendation:** Remove or repurpose `SearchAction` until you have real search. Optionally add client- or server-side search over articles and tool names later.

### 3.2 Articles pagination

- **Status:** [ ] Not started
- **What:** All articles are listed on one page.
- **Impact:** Slower and worse UX as the list grows.
- **Recommendation:** Add pagination (or "Load more") to `/articles`, e.g. 12–20 per page.

### 3.3 Image optimization

- **Status:** [ ] Not started
- **What:** Article featured images: no `loading="lazy"`, no `width`/`height`, no responsive/optimized handling. OG images could be optimized (format, size).
- **Impact:** Performance and Core Web Vitals; see [SEO_REVIEW.md](SEO_REVIEW.md).
- **Recommendation:** Add `loading="lazy"`, `width`/`height`, and consider SvelteKit image handling or a CDN. Optimize OG images.

### 3.4 Tests

- **Status:** [ ] Not started
- **What:** Only `demo.spec.ts` (e.g. 1+2=3). No tests for mortgage/loan calculations, article loading/filters/view-count, PDF generation, or critical routes.
- **Impact:** Higher risk of regressions.
- **Recommendation:** Add unit tests for `calculations.ts`, loan/PDF logic, and article helpers; add a few route or E2E tests for critical flows.

### 3.5 Loading and error UX

- **Status:** [ ] Not started
- **What:** No loading skeletons or route-level error UIs for tools.
- **Impact:** Abrupt or blank states during slower actions.
- **Recommendation:** Add loading states (e.g. for PDF generation) and friendly error messages for the mortgage calculator and loan generator.

### 3.6 Organization `sameAs` (social links)

- **Status:** [ ] Not started
- **What:** Homepage Organization schema has `sameAs` commented out.
- **Impact:** Missed SEO/social linkage when profiles exist.
- **Recommendation:** When Twitter/X, LinkedIn, etc. exist, add `sameAs` to the Organization JSON-LD.

### 3.7 Related articles

- **Status:** [ ] Not started
- **What:** No "Related articles" on article pages ([CODE_REVIEW.md](CODE_REVIEW.md)).
- **Impact:** Less engagement and internal linking.
- **Recommendation:** Show 2–4 related articles by tags/category at the bottom of each article.

### 3.8 Reading time

- **Status:** [ ] Not started
- **What:** `ArticleHeader` already shows reading time; logic may live in DB/migration. If not, it's noted in [CODE_REVIEW.md](CODE_REVIEW.md).
- **Impact:** Minor; mostly UX.
- **Recommendation:** Ensure reading time is computed and displayed; if missing, add it (e.g. in article processing or DB).

### 3.9 Article `loading="lazy"` on images

- **Status:** [ ] Not started
- **What:** [SEO_REVIEW.md](SEO_REVIEW.md): add `loading="lazy"` to images below the fold.
- **Impact:** Performance.
- **Recommendation:** Add `loading="lazy"` (and `width`/`height`) to article images that are below the fold; keep above-the-fold featured image eager if needed.

---

## 4. Summary table

| ID  | Item                       | Priority |
| --- | -------------------------- | -------- |
| 1.1 | Global navigation (header) | Critical |
| 1.2 | Custom error pages         | Critical |
| 1.3 | Legal / trust pages        | Critical |
| 1.4 | Auth: remove or enable     | Critical |
| 2.1 | Shared footer              | Medium   |
| 2.2 | Home link from subpages    | Medium   |
| 2.3 | Dynamic robots.txt         | Medium   |
| 2.4 | RSS feed                   | Medium   |
| 2.5 | Breadcrumbs                | Medium   |
| 3.1 | Search (placeholder)       | Lower    |
| 3.2 | Articles pagination        | Lower    |
| 3.3 | Image optimization         | Lower    |
| 3.4 | Tests                      | Lower    |
| 3.5 | Loading and error UX       | Lower    |
| 3.6 | Organization sameAs        | Lower    |
| 3.7 | Related articles           | Lower    |
| 3.8 | Reading time               | Lower    |
| 3.9 | Article image lazy load    | Lower    |

---

## 5. How to use this file

- **Pick an item:** e.g. "Implement 1.1" or "Add 2.4".
- **Update status:** When done, change `[ ]` to `[x]` for that item.
- **Optional:** Add a `Completed: YYYY-MM-DD` or `Note: ...` line under an item.

Example after implementing 1.1:

```markdown
### 1.1 Global navigation (header)

- **Status:** [x] Done
- **Completed:** 2025-02-15
- **What:** …
```
