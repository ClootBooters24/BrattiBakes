export async function onRequest({ env }) {
    if (!env.R2_PUBLIC_URL) {
        return Response.json({ error: "Brand assets are not configured." }, { status: 500 });
    }

    const publicBaseUrl = env.R2_PUBLIC_URL.replace(/\/+$/, "");
    const logoUrl = `${publicBaseUrl}/logos/Logo.webp`;

    return Response.json({ logoUrl }, {
        headers: { "Cache-Control": "public, max-age=3600" }
    });
}