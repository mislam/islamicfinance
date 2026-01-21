# Article Featured Images (Vercel Image)

How to add and use featured images for articles with responsive, retina-aware Vercel Image Optimization.

## Upload size and format

**Source: 1344×756 (16:9), JPG.**

No other size or format. This covers:

- **Slug page:** 672px max width → 1344px in source for 2× retina.
- **og:image, twitter:image, JSON-LD:** resized to 1200×630 from source (Vercel Image).
- **Index thumbnail:** 4:3 crop; up to 384px wide at 2× retina.

## Where to put files

1. **Static**

   Put the image under `static/`:

   ```
   static/images/articles/<slug>.jpg
   ```

   Example: `static/images/articles/riba-in-islam.jpg`

2. **Frontmatter and DB**

   In article frontmatter (and thus in `featured_image` in the DB), use a **path** (not a full URL), always `.jpg`:

   ```yaml
   featuredImage: "/images/articles/riba-in-islam.jpg"
   ```

   The path must start with `/` and match the file under `static/`.

3. **Migration**

   `pnpm articles:migrate` reads `featuredImage` from frontmatter and stores it in the DB. The file must exist at `static/images/articles/<slug>.jpg` (1344×756 JPG) before or after migration.

## How each image is used

| Use             | Crop / ratio | Max display size            | Retina                       |
| --------------- | ------------ | --------------------------- | ---------------------------- |
| Index thumbnail | 4:3          | 192px (sm+)                 | `srcset` 1x/2x (192, 384)    |
| Detail (slug)   | Wide, full   | 672px (sm+), 100vw (mobile) | `srcset` 430–1344w + `sizes` |
| og:image        | 1200×630     | 1200×630                    | Single URL                   |
| twitter:image   | same as OG   | —                           | Same as og:image             |
| JSON-LD image   | 1200×630     | —                           | Same URL as og:image         |

Retina is handled only via `srcset`; the browser chooses. **devicePixelRatio 1 does not load the 2× sources.**

## Vercel Image and `vercel.json`

`/_vercel/image` only works when an `images` block is defined. The project’s `vercel.json` includes:

- **`sizes`** – allowed widths (must include 192, 384, 430, 672, 860, 1200, 1344)
- **`remotePatterns`** – production media subdomain allowlisted for Image Optimization with HTTPS protocol and pathname restricted to `/images/articles/**` (only article images are optimized)

**Media Subdomain (`media.islamicfinance.app`):**

- Uses a cookie-free subdomain to avoid sending cookies with asset requests (improves performance and caching)
- Generic name allows future expansion to videos, fonts, and other static assets
- All article image URLs are constructed using this subdomain in production
- Pathname restriction (`/images/articles/**`) ensures only user-generated article images go through optimization; other static assets (logos, OG images) are served directly

**Note:** While Vercel docs suggest relative paths + `localPatterns` for same-origin images, that approach caused `INVALID_IMAGE_OPTIMIZE_REQUEST` errors. Using absolute URLs with `remotePatterns` (specifying HTTPS protocol and pathname) works reliably and provides better security.

- **External (CDN, other domains):** Add the domain(s) to `images.remotePatterns`. Example:

  ```json
  {
  	"images": {
  		"remotePatterns": [
  			{ "protocol": "https", "hostname": "cdn.example.com", "pathname": "/images/**" }
  		]
  	}
  }
  ```

- In **dev** (`pnpm dev`), `/_vercel/image` is not used; the raw static URL is used so images still load.

## Other places that use images

- **og:image, og:image:width, og:image:height** in `Head.svelte` — populated from `seo.ogImage` (optimized 1200×630 URL).
- **twitter:image** — same as `seo.ogImage` when `seo.twitterImage` is set (article page sets both).
- **JSON-LD `Article.image`** — `ImageObject` with the same 1200×630 URL and `width`/`height`.

All of these use `getArticleOgImageUrl()` when a featured image exists.
