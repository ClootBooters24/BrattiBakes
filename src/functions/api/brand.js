export async function onRequest({ request, env }) {
    if (!env.GALLERY_BUCKET) {
        return Response.json({ error: "Brand assets are not configured." }, { status: 500 });
    }

    const logoUrl = new URL("/images/logos/Logo.webp", request.url).toString();

    return Response.json({ logoUrl }, {
        headers: { "Cache-Control": "public, max-age=3600" }
    });
}