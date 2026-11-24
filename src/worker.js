import { onRequest as galleryRequest } from "./functions/api/gallery.js";
import { onRequest as brandRequest } from "./functions/api/brand.js";

export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);

        if (pathname === "/api/gallery" || pathname === "/api/brand") {
            if (request.method !== "GET") {
                return new Response("Method Not Allowed", { status: 405 });
            }

            return pathname === "/api/gallery"
                ? galleryRequest({ request, env })
                : brandRequest({ request, env });
        }

        if (pathname.startsWith("/images/")) {
            return serveR2Image(request, env.GALLERY_BUCKET);
        }

        return env.ASSETS.fetch(request);
    }
};

async function serveR2Image(request, bucket) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", { status: 405 });
    }
    if (!bucket) return new Response("Image storage is not configured.", { status: 503 });

    let key;
    try {
        key = decodeURIComponent(new URL(request.url).pathname.slice("/images/".length));
    } catch {
        return new Response("Bad Request", { status: 400 });
    }

    if (!key || key.startsWith("/") || key.includes("\\") || key.split("/").includes("..")) {
        return new Response("Bad Request", { status: 400 });
    }

    const object = await bucket.get(key);
    if (!object) return new Response("Not Found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(request.method === "HEAD" ? null : object.body, { headers });
}