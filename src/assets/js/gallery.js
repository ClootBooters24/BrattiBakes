const grid = document.querySelector("[data-gallery-grid]");
const status = document.querySelector("[data-gallery-status]");
const filterControls = document.querySelector("[data-gallery-filter-controls]");
let galleryEntries = [];

function showCategory(selectedCategory) {
    for (const button of filterControls.children) {
        button.setAttribute("aria-pressed", String(button.dataset.category === selectedCategory));
    }

    const visibleEntries = selectedCategory
        ? galleryEntries.filter((entry) => entry.category === selectedCategory)
        : galleryEntries;
    renderGallery(visibleEntries);
}

function configureCategoryFilter(entries) {
    const categories = [...new Set(entries.map((entry) => entry.category).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second));

    filterControls.replaceChildren();
    for (const category of ["", ...categories]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-filter-button";
        button.textContent = category || "All";
        button.dataset.category = category;
        button.setAttribute("aria-pressed", String(category === ""));
        button.addEventListener("click", () => showCategory(category));
        filterControls.append(button);
    }

    filterControls.hidden = categories.length < 2;
}

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

        galleryEntries = entries;
        configureCategoryFilter(galleryEntries);
        renderGallery(galleryEntries);
    } catch {
        status.textContent = "The gallery couldn't be loaded right now. Please try again later.";
    } finally {
        grid.setAttribute("aria-busy", "false");
    }
}

loadGallery();