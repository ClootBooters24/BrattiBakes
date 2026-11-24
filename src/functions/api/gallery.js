function imageUrlFor(imageKey, request) {
    const encodedKey = imageKey.split("/").map(encodeURIComponent).join("/");
    return new URL(`/images/${encodedKey}`, request.url).toString();
}

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function labelFrom(value) {
    return value
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function isGalleryImage(key) {
    const normalizedKey = key.toLowerCase();
    const extension = normalizedKey.slice(normalizedKey.lastIndexOf("."));
    return !normalizedKey.startsWith("logos/") && imageExtensions.has(extension);
}

async function loadMetadata(kv) {
    const metadata = new Map();
    if (!kv) return metadata;

    let cursor;
    do {
        const page = await kv.list({ limit: 1000, ...(cursor ? { cursor } : {}) });
        const records = await Promise.all(page.keys.map(async ({ name }) => {
            const value = await kv.get(name);
            if (value === null) return null;

            const entry = JSON.parse(value);
            if (!entry || typeof entry !== "object" || typeof entry.imageKey !== "string") return null;
            return entry;
        }));

        for (const entry of records.filter(Boolean)) metadata.set(entry.imageKey, entry);
        cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);

    return metadata;
}

async function listBucketImages(bucket, metadata, request) {
    const entries = [];
    let cursor;

    do {
        const page = await bucket.list({ limit: 1000, ...(cursor ? { cursor } : {}) });
        for (const object of page.objects) {
            if (!isGalleryImage(object.key)) continue;

            const override = metadata.get(object.key) ?? {};
            const fileName = object.key.split("/").pop();
            const categoryPath = object.key.split("/").slice(0, -1).join("/");
            const category = labelFrom(categoryPath || "Bratti Bakes");
            const title = override.title || labelFrom(fileName);

            entries.push({
                ...override,
                id: override.id ?? object.key,
                imageKey: object.key,
                title,
                category: override.category || category,
                alt: override.alt || `${title} from ${category}`,
                imageUrl: imageUrlFor(object.key, request)
            });
        }

        cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);

    return entries;
}

export async function onRequest({ request, env }) {
    try {
        if (env.GALLERY_BUCKET) {
            const metadata = await loadMetadata(env.GALLERY_KV);
            const entries = await listBucketImages(env.GALLERY_BUCKET, metadata, request);
            return Response.json(entries, {
                headers: { "Cache-Control": "public, max-age=60" }
            });
        }

        if (!env.GALLERY_KV) {
            return Response.json({ error: "Gallery service is not configured." }, { status: 500 });
        }

        const entries = [];
        let cursor;
        do {
            const page = await env.GALLERY_KV.list({ limit: 1000, ...(cursor ? { cursor } : {}) });
            const pageEntries = await Promise.all(page.keys.map(async ({ name }) => {
                const value = await env.GALLERY_KV.get(name);
                if (value === null) return null;

                const entry = JSON.parse(value);
                if (!entry || typeof entry !== "object" || typeof entry.imageKey !== "string") return null;

                return {
                    ...entry,
                    id: entry.id ?? name,
                    imageUrl: imageUrlFor(entry.imageKey, request)
                };
            }));

            entries.push(...pageEntries.filter(Boolean));
            cursor = page.list_complete ? undefined : page.cursor;
        } while (cursor);

        return Response.json(entries, {
            headers: { "Cache-Control": "public, max-age=60" }
        });
    } catch {
        return Response.json({ error: "Unable to load the gallery." }, { status: 500 });
    }
}