const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-form-status]");
const referenceImage = document.querySelector("#reference-image");
const web3FormsAccessKey = "YOUR_WEB3FORMS_ACCESS_KEY";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const image = referenceImage.files[0];
    if (image && !image.type.startsWith("image/")) {
        status.textContent = "Please choose an image file.";
        return;
    }
    if (image && image.size > 1024 * 1024) {
        status.textContent = "Please choose an image smaller than 1 MB.";
        return;
    }

    status.textContent = "Sending...";

    const payload = new FormData(form);
    payload.append("access_key", web3FormsAccessKey);
    payload.append("subject", "New custom order inquiry");
    if (!payload.has("marketing_consent")) payload.set("marketing_consent", "no");

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: payload
        });
        const result = await response.json();

        if (!response.ok || !result.success) throw new Error("Form submission failed");

        form.reset();
        status.textContent = "Thanks! Your inquiry has been sent.";
    } catch {
        status.textContent = "Your inquiry couldn't be sent. Please try again later.";
    }
});