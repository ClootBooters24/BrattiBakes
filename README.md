# Bratti Bakes

Static Cloudflare Pages site kept under `src/`. There is no build step, package manager, or Node.js runtime requirement.

## Pages setup

1. In Cloudflare Pages, set the project root directory to `/src`, leave the build command empty, and set the build output directory to `.`.
2. Open **Settings > Functions > R2 bucket bindings** and bind `brattibakes-r2` as `GALLERY_BUCKET`. The gallery automatically lists image objects from the bucket and skips non-image files and objects under `logos/`.
3. Add `R2_PUBLIC_URL` as a production and preview environment variable. Set it to the public base URL for the R2 bucket, without a trailing slash.
4. Optionally bind a KV namespace as `GALLERY_KV` to override generated gallery titles and alt text. Each value must be JSON with an `imageKey` matching an object key in the R2 bucket.

Example KV value:

```json
{
	"title": "Celebration cake",
	"alt": "Decorated celebration cake with piped flowers",
	"imageKey": "gallery/celebration-cake.jpg"
}
```

The Pages Function at `functions/api/gallery.js` lists image objects through `GALLERY_BUCKET`, generates category and filename captions, and adds an `imageUrl` using `R2_PUBLIC_URL`. If `GALLERY_BUCKET` is not bound, it falls back to the existing KV-based gallery. The header logo is served from `logos/Logo.webp` through `/api/brand`. Ensure the public base URL can serve these objects; the bucket dashboard currently shows public access as disabled.

## Contact form

The contact form submits order inquiries to Web3Forms from `assets/js/contact.js`. Replace the `YOUR_WEB3FORMS_ACCESS_KEY` placeholder there with the access key for the Bratti Bakes Web3Forms form. This is a public form key, not a private API secret. Optional reference image uploads require a Web3Forms Pro plan. The optional marketing checkbox records the customer's choice with the inquiry; it does not sync addresses to a separate email-marketing list. No Pages Function or server-side secret binding is used for contact submissions.

## Sitemap

`src/sitemap.xml` is a hand-maintained static file for `https://brattibakes.com`. Update it manually whenever pages are added or removed.