import { getCountdown } from "./countdown.mjs";

const menu = document.querySelector("#menuToggle");
const links = document.querySelector("#navLinks");
const setMenuOpen = (open) => {
  links.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.textContent = open ? "×" : "☰";
};
document.documentElement.classList.add("js");
menu.hidden = false;
menu.addEventListener("click", () =>
  setMenuOpen(menu.getAttribute("aria-expanded") !== "true"),
);
links
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav")) setMenuOpen(false);
});
window
  .matchMedia("(min-width:701px)")
  .addEventListener("change", () => setMenuOpen(false));

const dialog = document.querySelector("#inviteDialog");
const preview = document.querySelector("#previewInvite");
preview.addEventListener("click", (event) => {
  if (typeof dialog.showModal !== "function") return;
  event.preventDefault();
  dialog.showModal();
  document.body.classList.add("modal-open");
});
document
  .querySelector("#closeDialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  preview.focus({ preventScroll: true });
});

const updateCountdown = () => {
  const remaining = getCountdown(Date.now());
  ["days", "hours", "minutes", "seconds"].forEach((unit) => {
    document.getElementById(unit).textContent = String(
      remaining[unit],
    ).padStart(2, "0");
  });
  if (remaining.complete) {
    document.querySelector("#countdownTitle").textContent =
      "Our wedding day has arrived";
    document.querySelector("#countdownNote").textContent =
      "13 December 2026 — the beginning of our forever. Thank you for celebrating with us.";
  }
  return remaining.complete;
};
if (!updateCountdown()) {
  const timer = window.setInterval(() => {
    if (updateCountdown()) window.clearInterval(timer);
  }, 1000);
}

const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!motion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      ".section-heading, .event, .guide-intro, .invite-copy, .invite-photo, .closing",
    )
    .forEach((element) => {
      element.classList.add("reveal");
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("is-pending");
        observer.observe(element);
      }
    });
  motion.addEventListener("change", () => {
    if (motion.matches) {
      document
        .querySelectorAll(".is-pending")
        .forEach((element) => element.classList.remove("is-pending"));
      observer.disconnect();
    }
  });
}
