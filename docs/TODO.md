# TODO

Tracking gaps and enhancements for the Islamic Finance site. Use this file to pick items to implement (e.g. "implement 1.1" or "add 2.3").

**See also:** [CODE_REVIEW.md](CODE_REVIEW.md) — Articles: what's implemented, code quality, security, performance. [SEO_REVIEW.md](SEO_REVIEW.md) — SEO audit and implementation details (BreadcrumbList, canonical, OG, etc.).

---

## 1. Critical / High-Impact

### 1.1 Custom error pages

- **Status:** [ ] Not started
- **What:** No `+error.svelte`. 404/500 use SvelteKit's default (often unstyled).
- **Impact:** Poor UX and branding on errors.
- **Recommendation:** Add `src/routes/+error.svelte` (and optionally `+error@.svelte`) with simple copy, link to home, and existing styles.

### 1.2 Legal / trust pages

- **Status:** [ ] Not started
- **What:** No Privacy, Terms, About, or Contact.
- **Impact:** Cookies (`vid`), GA, and future auth make a privacy policy expected (GDPR/CCPA). Terms help for tools that generate legal docs. About/Contact help trust and support.
- **Recommendation:**
  - Add `/privacy` (and `/privacy-policy` redirect if desired).
  - Add `/terms` (or `/terms-of-service`).
  - Add `/about` (and optionally `/contact` or `#contact` on About).
  - Link all in a shared footer.

### 1.3 Auth: remove or enable

- **Status:** [ ] Not started
- **What:** Better Auth + Google is wired in code but **disabled** in `hooks.server.ts`.
- **Impact:** Unused auth adds maintenance; if you enable it later, you'll need handler + `/api/auth/[...]` and sign-in UI.
- **Recommendation:** Either remove auth-related code and schema if unused, or enable it in `hooks.server.ts`, add the auth API route, and minimal sign-in/sign-out UI and any protected routes.

---

## 2. Medium priority

### 2.1 Breadcrumbs

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

- **Status:** [ ] Partially done
- **What:**
  - ✅ Vercel Image Optimization implemented with responsive `srcset` and `sizes`
  - ✅ `width`/`height` attributes present on all article images
  - ✅ OG images optimized to 1200×630 via Vercel Image
  - ⚠️ Missing: `loading="lazy"` on ArticleCard images (below the fold)
- **Impact:** Minor performance improvement from lazy loading below-the-fold images.
- **Recommendation:** Add `loading="lazy"` to ArticleCard images in `src/routes/articles/ArticleCard.svelte` (detail page featured image correctly doesn't have lazy as it's above the fold).

### 3.4 Tests

- **Status:** [ ] Not started
- **What:** Only `demo.spec.ts` (e.g. 1+2=3). No tests for mortgage/loan calculations, article loading/filters/view-count, PDF generation, or critical routes.
- **Impact:** Higher risk of regressions.
- **Recommendation:** Add unit tests for `calculations.ts`, loan/PDF logic, and article helpers; add a few route or E2E tests for critical flows.

### 3.5 Loading and error UX

- **Status:** [ ] Partially done
- **What:**
  - ✅ Loading state implemented for PDF generation in loan generator (spinner, disabled button)
  - ⚠️ Missing: Better error messages (currently uses `alert()` for errors)
  - ⚠️ Missing: Loading skeletons for route-level navigation
- **Impact:** Minor UX improvement from better error handling and route transitions.
- **Recommendation:** Replace `alert()` with friendly error UI components, add loading skeletons for route transitions.

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

---

## 4. Summary table

| ID  | Item                   | Priority | Status            |
| --- | ---------------------- | -------- | ----------------- |
| 1.1 | Custom error pages     | Critical | ⏳ Not started    |
| 1.2 | Legal / trust pages    | Critical | ⏳ Not started    |
| 1.3 | Auth: remove or enable | Critical | ⏳ Not started    |
| 2.1 | Breadcrumbs            | Medium   | ⏳ Not started    |
| 3.1 | Search (placeholder)   | Lower    | ⏳ Not started    |
| 3.2 | Articles pagination    | Lower    | ⏳ Not started    |
| 3.3 | Image optimization     | Lower    | 🟡 Partially done |
| 3.4 | Tests                  | Lower    | ⏳ Not started    |
| 3.5 | Loading and error UX   | Lower    | 🟡 Partially done |
| 3.6 | Organization sameAs    | Lower    | ⏳ Not started    |
| 3.7 | Related articles       | Lower    | ⏳ Not started    |

---

## 5. How to use this file

- **Pick an item:** e.g. "Implement 1.1" or "Add 2.1".
- **Update status:** When done, change `[ ]` to `[x]` for that item.
- **Optional:** Add a `Completed: YYYY-MM-DD` or `Note: ...` line under an item.
- **Status format:** Use `[x]` for completed items, `[ ]` for not started items.
- **Completed items:** Once verified as fully implemented, remove them from this file to keep it focused on remaining work.
