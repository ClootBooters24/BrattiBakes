const grid = document.querySelector("[data-gallery-grid]");
const status = document.querySelector("[data-gallery-status]");

function renderGallery(entries) {
    grid.replaceChildren();

    for (const entry of entries) {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        image.src = entry.imageUrl;
        image.alt = entry.alt || entry.title || "Bratti Bakes creation";
        image.loading = "lazy";

        figure.className = "gallery-item";
        figure.append(image);

        if (entry.title || entry.category) {
            const caption = document.createElement("figcaption");
            if (entry.category) {
                const category = document.createElement("span");
                category.className = "gallery-category";
                category.textContent = entry.category;
                caption.append(category);
            }

            if (entry.title) {
                const title = document.createElement("span");
                title.className = "gallery-title";
                title.textContent = entry.title;
                caption.append(title);
            }

            figure.append(caption);
        }

        grid.append(figure);
    }

    status.textContent = entries.length ? "" : "The gallery is being filled. Please check back soon.";
}

async function loadGallery() {
    try {
        const response = await fetch("/api/gallery", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Gallery request failed");

        const entries = await response.json();
        if (!Array.isArray(entries)) throw new Error("Unexpected gallery response");

        renderGallery(entries);
    } catch {
        status.textContent = "The gallery couldn't be loaded right now. Please try again later.";
    } finally {
        grid.setAttribute("aria-busy", "false");
    }
}

loadGallery();