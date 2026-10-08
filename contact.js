// Formspree receives submissions; no inbox credentials or local storage are used.
const form = document.querySelector("#contact-form");
const fields = [...form.querySelectorAll("input[required], textarea[required]")];
const button = form.querySelector("button");
let sending = false;
const status = document.querySelector("#contact-status");
const touched = new Set();
function validate(field) {
  const valid = field.validity.valid && field.value.trim().length > 0;
  field.setAttribute("aria-invalid", String(!valid));
  document.getElementById(`${field.id}-error`).textContent = valid ? "" :
    field.type === "email" ? "Enter a valid email address so we can reply." : "Write a message before continuing.";
  return valid;
}
for (const field of fields) {
  field.addEventListener("blur", () => { touched.add(field); validate(field); });
  field.addEventListener("input", () => {
    if (touched.has(field)) validate(field);
    status.textContent = "";
  });
}
button.disabled = false;
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (sending) return;
  const invalid = fields.filter(field => { touched.add(field); return !validate(field); });
  if (invalid.length) { invalid[0].focus(); return; }
  sending = true;
  button.disabled = true;
  button.textContent = "Sending…";
  form.setAttribute("aria-busy", "true");
  status.textContent = "Sending your message…";
  try {
    const response = await fetch(form.action, {
      method: "POST", body: new FormData(form), headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000), credentials: "omit", referrerPolicy: "no-referrer"
    });
    if (!response.ok) throw new Error(response.status === 429 ? "rate-limit" : "submission");
    status.textContent = "Your message was accepted. Thank you for contacting LazyDeals.";
    form.reset();
    touched.clear();
  } catch (error) {
    status.textContent = error.message === "rate-limit"
      ? "Too many submissions. Please wait before trying again, or email lazydeals.help@outlook.com."
      : "We couldn’t confirm your submission. Your message is still here. Try again later or email lazydeals.help@outlook.com.";
  } finally {
    sending = false;
    button.disabled = false;
    button.textContent = "Send message";
    form.removeAttribute("aria-busy");
  }
});
