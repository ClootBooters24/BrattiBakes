# Bratti Bakes

Static Cloudflare Workers + Assets site kept under `src/`. There is no build step or package manager requirement.

## Deploy

Cloudflare Workers Builds should use `src` as the root directory and `npx wrangler deploy` as the deploy command. The checked-in `src/wrangler.json` configures the Worker, Assets, and `brattibakes-r2` binding. To deploy locally:

```sh
cd src
npx wrangler deploy
```

The Worker serves R2 objects through `/images/`, so the bucket does not need public access enabled. Optionally add a KV namespace binding named `GALLERY_KV` to override generated gallery titles and alt text. Each KV value must be JSON with an `imageKey` matching an object key in the R2 bucket.

Example KV value:

```json
{
	"title": "Celebration cake",
	"alt": "Decorated celebration cake with piped flowers",
	"imageKey": "gallery/celebration-cake.jpg"
}
```

The Worker entrypoint routes `/api/gallery`, `/api/brand`, and `/images/*`; other requests are served from Workers Assets. The gallery lists image objects through `GALLERY_BUCKET`, displays category labels without exposing generated filenames, and skips non-image files and objects under `logos/` and `Store/`. Visitors can filter by category. Optional KV titles and alt text provide human-written captions. If `GALLERY_BUCKET` is unavailable, the gallery falls back to KV records. The header logo is served from `logos/Logo.webp` through the same private R2 image route.

## Contact form

The contact form submits order inquiries to Web3Forms from `assets/js/contact.js`. Replace the `YOUR_WEB3FORMS_ACCESS_KEY` placeholder there with the access key for the Bratti Bakes Web3Forms form. This is a public form key, not a private API secret. Optional reference image uploads require a Web3Forms Pro plan. The optional marketing checkbox records the customer's choice with the inquiry; it does not sync addresses to a separate email-marketing list. No Pages Function or server-side secret binding is used for contact submissions.

## Sitemap

`src/sitemap.xml` is a hand-maintained static file for `https://brattibakes.com`. Update it manually whenever pages are added or removed.