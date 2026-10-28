const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-form-status]");
const web3FormsAccessKey = "YOUR_WEB3FORMS_ACCESS_KEY";

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const payload = Object.fromEntries(new FormData(form));
    payload.access_key = web3FormsAccessKey;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) throw new Error("Form submission failed");

        form.reset();
        status.textContent = "Thanks! Your inquiry has been sent.";
    } catch {
        status.textContent = "Your inquiry couldn't be sent. Please try again later.";
    }
});