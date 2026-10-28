function imageUrlFor(imageKey, publicBaseUrl) {
    const encodedKey = imageKey.split("/").map(encodeURIComponent).join("/");
    return `${publicBaseUrl}/${encodedKey}`;
}

export async function onRequest({ env }) {
    if (!env.GALLERY_KV || !env.R2_PUBLIC_URL) {
        return Response.json({ error: "Gallery service is not configured." }, { status: 500 });
    }

    const publicBaseUrl = env.R2_PUBLIC_URL.replace(/\/+$/, "");
    const entries = [];
    let cursor;

    try {
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
                    imageUrl: imageUrlFor(entry.imageKey, publicBaseUrl)
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