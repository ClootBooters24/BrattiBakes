# Bratti Bakes

Static Cloudflare Pages site kept under `src/`. There is no build step, package manager, or Node.js runtime requirement.

## Pages setup

1. In Cloudflare Pages, set the project root directory to `/src`, leave the build command empty, and set the build output directory to `.`.
2. Open **Settings > Functions > KV namespace bindings** and bind the KV namespace as `GALLERY_KV`.
3. Add `R2_PUBLIC_URL` as a production and preview environment variable. Set it to the public base URL for the R2 bucket, without a trailing slash.
4. Add gallery records to `GALLERY_KV`. Each value must be JSON with an `imageKey` matching an object key in the R2 bucket. Other fields are passed through to the browser; `title` and `alt` are used by the gallery page.

Example KV value:

```json
{
	"title": "Celebration cake",
	"alt": "Decorated celebration cake with piped flowers",
	"imageKey": "gallery/celebration-cake.jpg"
}
```

The Pages Function at `functions/api/gallery.js` lists all KV keys, loads their JSON values, and adds an `imageUrl` using `R2_PUBLIC_URL`. The browser requests only `/api/gallery`; it never accesses KV directly.

## Contact form

The contact form submits to Web3Forms from `assets/js/contact.js`. Replace the `YOUR_WEB3FORMS_ACCESS_KEY` placeholder there with the access key for the Bratti Bakes Web3Forms form. This is a public form key, not a private API secret. No Pages Function or server-side secret binding is used for contact submissions.

## Sitemap

`src/sitemap.xml` is a hand-maintained static file for `https://brattibakes.com`. Update it manually whenever pages are added or removed.