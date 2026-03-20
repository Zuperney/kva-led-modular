import { bootstrapApp } from "./ui/bootstrap.js";

bootstrapApp();

setupMobileTopBehavior();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      // Service worker é opcional; falha não bloqueia a aplicação.
    });
  });
}

function setupMobileTopBehavior() {
  const toggle = document.getElementById("btnTopCompactToggle");
  if (!(toggle instanceof HTMLButtonElement)) return;

  const mediaQuery = window.matchMedia("(max-width: 980px)");

  const syncToggleState = () => {
    const expanded = document.body.classList.contains("mobile-top-expanded");
    toggle.textContent = expanded ? "Ocultar topo" : "Mostrar topo";
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  const applyViewportState = () => {
    if (mediaQuery.matches) {
      document.body.classList.add("mobile-top-compact");
    } else {
      document.body.classList.remove("mobile-top-compact");
      document.body.classList.remove("mobile-top-expanded");
    }
    syncToggleState();
  };

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("mobile-top-expanded");
    syncToggleState();
  });

  document.querySelectorAll(".category-nav [data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!mediaQuery.matches) return;
      document.body.classList.remove("mobile-top-expanded");
      syncToggleState();
    });
  });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", applyViewportState);
  } else {
    mediaQuery.addListener(applyViewportState);
  }

  applyViewportState();
}
