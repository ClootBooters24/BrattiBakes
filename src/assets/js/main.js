document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});

async function loadBrandLogo() {
    const brand = document.querySelector("[data-brand]");
    if (!brand) return;

    try {
        const response = await fetch("/api/brand", { headers: { Accept: "application/json" } });
        if (!response.ok) return;

        const { logoUrl } = await response.json();
        if (typeof logoUrl !== "string") return;

        const logo = document.createElement("img");
        logo.src = logoUrl;
        logo.alt = "";
        logo.loading = "eager";
        brand.replaceChildren(logo);
    } catch {}
}

loadBrandLogo();