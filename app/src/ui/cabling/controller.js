export function bindCablingEvents(params) {
  const { refs, getUi, setUi } = params;
  let overclockNoticeTimer = null;

  const showOverclockNotice = (enabled) => {
    const status = refs.migrationStatus;
    if (!status) return;

    if (overclockNoticeTimer) {
      window.clearTimeout(overclockNoticeTimer);
      overclockNoticeTimer = null;
    }

    if (!enabled) return;

    status.textContent =
      "Overclock ativado: a distribuicao de cabeamento pode exceder a capacidade recomendada por gabinete/porta. Revise o dimensionamento antes da implantacao.";
    overclockNoticeTimer = window.setTimeout(() => {
      if (status.textContent.includes("Overclock ativado")) {
        status.textContent = "";
      }
      overclockNoticeTimer = null;
    }, 4200);
  };

  const syncQuickControls = () => {
    const quickBar = refs.cablingQuickBar;
    if (!(quickBar instanceof HTMLElement)) return;

    const orientation = refs.cfgCablingOrientation?.value;
    const strategy = refs.cfgCablingStrategy?.value;
    const overclockEnabled = refs.cfgOverclock?.checked === true;

    quickBar.querySelectorAll(".cabling-quick-btn").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const action = button.dataset.cablingAction;
      const value = button.dataset.value;

      let isActive = false;
      if (action === "orientation") {
        isActive = value === orientation;
      } else if (action === "strategy") {
        isActive = value === strategy;
      } else if (action === "overclock") {
        isActive = overclockEnabled;
      }

      button.classList.toggle("is-active", isActive);
    });
  };

  const triggerControlChange = (control) => {
    if (!control) return;
    control.dispatchEvent(new Event("change", { bubbles: true }));
  };

  refs.cfgCablingOrientation?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ cablingOrientation: target.value });
    syncQuickControls();
  });

  refs.cfgCablingStrategy?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ cablingStrategy: target.value });
    syncQuickControls();
  });

  refs.cfgOverclock?.addEventListener("change", () => {
    syncQuickControls();
  });

  refs.cablingQuickBar?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest(".cabling-quick-btn");
    if (!(button instanceof HTMLButtonElement)) return;

    const action = button.dataset.cablingAction;
    const value = button.dataset.value;

    if (action === "orientation" && value && refs.cfgCablingOrientation) {
      refs.cfgCablingOrientation.value = value;
      triggerControlChange(refs.cfgCablingOrientation);
      return;
    }

    if (action === "strategy" && value && refs.cfgCablingStrategy) {
      refs.cfgCablingStrategy.value = value;
      triggerControlChange(refs.cfgCablingStrategy);
      return;
    }

    if (action === "overclock" && refs.cfgOverclock) {
      refs.cfgOverclock.checked = !refs.cfgOverclock.checked;
      triggerControlChange(refs.cfgOverclock);
      showOverclockNotice(refs.cfgOverclock.checked);
      return;
    }

    if (action === "rebuild") {
      refs.btnRebuildCanvas?.click();
    }
  });

  refs.cablingScreensList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const screenId = target.dataset.screenId;
    if (screenId) {
      setUi({ selectedScreenId: screenId });
    }
  });

  refs.btnRebuildCanvas?.addEventListener("click", () => {
    setUi({ activeView: "cabling" });
  });

  let isPannable = false;
  let startX = 0;
  let startY = 0;

  refs.cablingCanvas?.addEventListener("mousedown", (event) => {
    isPannable = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  refs.cablingCanvas?.addEventListener("mouseup", () => {
    isPannable = false;
  });

  refs.cablingCanvas?.addEventListener("mouseleave", () => {
    isPannable = false;
  });

  refs.cablingCanvas?.addEventListener("mousemove", (event) => {
    if (!isPannable) return;
    const ui = getUi();
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    startX = event.clientX;
    startY = event.clientY;

    setUi({
      cablingCanvasPanX: ui.cablingCanvasPanX + dx / ui.cablingCanvasZoom,
      cablingCanvasPanY: ui.cablingCanvasPanY + dy / ui.cablingCanvasZoom,
    });
  });

  refs.cablingCanvas?.addEventListener("wheel", (event) => {
    event.preventDefault();
    const ui = getUi();
    const scaleAmount = 0.1;
    const newZoom =
      event.deltaY > 0
        ? ui.cablingCanvasZoom - scaleAmount
        : ui.cablingCanvasZoom + scaleAmount;
    setUi({ cablingCanvasZoom: Math.max(0.1, newZoom) });
  });

  refs.btnZoomIn?.addEventListener("click", () => {
    const ui = getUi();
    setUi({ cablingCanvasZoom: ui.cablingCanvasZoom + 0.2 });
  });

  refs.btnZoomOut?.addEventListener("click", () => {
    const ui = getUi();
    setUi({ cablingCanvasZoom: Math.max(0.1, ui.cablingCanvasZoom - 0.2) });
  });

  refs.btnZoomReset?.addEventListener("click", () => {
    setUi({
      cablingCanvasZoom: 1,
      cablingCanvasPanX: 0,
      cablingCanvasPanY: 0,
    });
  });

  syncQuickControls();
}
