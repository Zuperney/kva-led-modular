import { bootstrapApp } from "./ui/bootstrap.js";

bootstrapApp();

setupMobileTabsMenu();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      // Service worker é opcional; falha não bloqueia a aplicação.
    });
  });
}

function setupMobileTabsMenu() {
  const toggle = document.getElementById("btnTabsMenu");
  const tabsNav = document.getElementById("tabsNav");
  if (
    !(toggle instanceof HTMLButtonElement) ||
    !(tabsNav instanceof HTMLElement)
  ) {
    return;
  }

  const mediaQuery = window.matchMedia("(max-width: 980px)");

  const syncState = () => {
    const open = document.body.classList.contains("mobile-tabs-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const closeTabsMenu = () => {
    document.body.classList.remove("mobile-tabs-open");
    syncState();
  };

  const applyViewportState = () => {
    if (!mediaQuery.matches) {
      closeTabsMenu();
    }
    syncState();
  };

  toggle.addEventListener("click", () => {
    if (!mediaQuery.matches) return;
    document.body.classList.toggle("mobile-tabs-open");
    syncState();
  });

  tabsNav.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!mediaQuery.matches) return;
      closeTabsMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!mediaQuery.matches) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (toggle.contains(target) || tabsNav.contains(target)) return;
    closeTabsMenu();
  });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", applyViewportState);
  } else {
    mediaQuery.addListener(applyViewportState);
  }

  applyViewportState();
}
