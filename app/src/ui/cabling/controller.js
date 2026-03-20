export function bindCablingEvents(params) {
  const { refs, getUi, setUi } = params;

  refs.cfgCablingOrientation?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ cablingOrientation: target.value });
  });

  refs.cfgCablingStrategy?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ cablingStrategy: target.value });
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
}
