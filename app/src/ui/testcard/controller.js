import {
  findPlacementAtPoint,
  mapMouseToComposition,
  snapPlacement,
} from "./snap.js";
import { buildTestCardComposition } from "./composition.js";

export function bindTestCardEvents(params) {
  const { refs, getState, getUi, setUi, computeProject, exportTestCard } =
    params;

  refs.testCardScreen?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ testCardScreenId: target.value || null });
  });

  refs.btnAddTestCardScreen?.addEventListener("click", () => {
    const ui = getUi();
    const selectedId = String(ui.testCardScreenId || "");
    if (!selectedId) return;

    const currentIds = Array.isArray(ui.testCardCompositionIds)
      ? ui.testCardCompositionIds.map(String)
      : [];
    if (currentIds.includes(selectedId)) return;

    const result = computeProject({
      config: getState().config,
      screens: getState().screens,
    });
    const currentComposition = buildTestCardComposition(result.screens, ui);
    const gap = Math.max(0, Number(ui.testCardGapPx) || 0);
    const nextManual = {
      ...(ui.testCardManualPositions || {}),
      [selectedId]: {
        x: currentComposition ? currentComposition.width + gap : 0,
        y: 0,
      },
    };

    setUi({
      testCardUseAllScreens: false,
      testCardCompositionIds: currentIds.concat(selectedId),
      testCardManualPositions: nextManual,
      testCardActivePlacementId: selectedId,
    });
  });

  refs.btnClearTestCardScreens?.addEventListener("click", () => {
    setUi({
      testCardUseAllScreens: false,
      testCardCompositionIds: [],
      testCardManualPositions: {},
      testCardActivePlacementId: null,
    });
  });

  refs.testCardSelectedScreens?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const actionNode = target.closest("[data-action]");
    if (!(actionNode instanceof HTMLElement)) return;

    const buttonNode = target.closest("button.testcard-screen-chip");
    const screenId = String(
      actionNode.dataset.screenId || buttonNode?.dataset.screenId || "",
    );
    const action = String(actionNode.dataset.action || "");
    if (!screenId) return;

    const ui = getUi();
    const currentIds = Array.isArray(ui.testCardCompositionIds)
      ? ui.testCardCompositionIds.map(String)
      : [];

    if (action === "remove") {
      const nextIds = currentIds.filter((id) => id !== screenId);
      const nextManual = { ...(ui.testCardManualPositions || {}) };
      delete nextManual[screenId];
      setUi({
        testCardCompositionIds: nextIds,
        testCardUseAllScreens: false,
        testCardManualPositions: nextManual,
        testCardActivePlacementId:
          ui.testCardActivePlacementId === screenId
            ? nextIds[0] || null
            : ui.testCardActivePlacementId,
      });
      return;
    }

    setUi({ testCardActivePlacementId: screenId });
  });

  refs.testCardUseAllScreens?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const result = computeProject({
      config: getState().config,
      screens: getState().screens,
    });
    if (target.checked) {
      const allIds = result.screens.map((screen) => String(screen.id));
      setUi({
        testCardUseAllScreens: true,
        testCardCompositionIds: allIds,
        testCardManualPositions: {},
        testCardActivePlacementId: allIds[0] || null,
      });
      return;
    }

    const first = String(
      getUi().testCardScreenId || result.screens[0]?.id || "",
    );
    setUi({
      testCardUseAllScreens: false,
      testCardCompositionIds: first ? [first] : [],
      testCardManualPositions: {},
      testCardActivePlacementId: first || null,
    });
  });

  refs.testCardLayout?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ testCardLayout: target.value || "horizontal" });
  });

  refs.testCardGapPx?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const parsed = Number.parseInt(target.value || "0", 10);
    setUi({ testCardGapPx: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 });
  });

  refs.testCardGridCols?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const parsed = Number.parseInt(target.value || "1", 10);
    setUi({
      testCardGridCols: Number.isFinite(parsed) ? Math.max(1, parsed) : 1,
    });
  });

  refs.testCardPreset?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ testCardPreset: target.value || "classic" });
  });

  refs.testCardTitle?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardTitle: target.value || "LED TEST CARD" });
  });

  refs.testCardBg?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardBg: target.value || "#0f172a" });
  });

  refs.testCardFg?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardFg: target.value || "#e5e7eb" });
  });

  refs.testCardAccent?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardAccent: target.value || "#22d3ee" });
  });

  [refs.testCardBg, refs.testCardFg, refs.testCardAccent].forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;

    const palette = document.querySelector(
      `[data-color-palette="${input.id}"]`,
    );
    if (!(palette instanceof HTMLElement)) return;

    palette.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const swatch = target.closest(".testcard-color-swatch");
      if (swatch instanceof HTMLElement) {
        const color = String(swatch.dataset.color || "");
        if (!color) return;
        input.value = color;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      const picker = target.closest(".testcard-color-picker");
      if (!(picker instanceof HTMLElement)) return;

      // Use native color dialog to preserve browser compatibility.
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.click();
      }
    });
  });

  refs.testCardShowGrid?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardShowGrid: target.checked });
  });

  refs.testCardShowCabling?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardShowCabling: target.checked });
  });

  refs.testCardShowNames?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardShowNames: target.checked });
  });

  refs.testCardShowTargets?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    setUi({ testCardShowTargets: target.checked });
  });

  refs.btnExportTestCardPng?.addEventListener("click", () => {
    const currentUi = getUi();
    const currentState = getState();
    const result = computeProject({
      config: currentState.config,
      screens: currentState.screens,
    });
    exportTestCard(
      refs,
      {
        ...currentUi,
        testCardProjectConfig: {
          ...currentState.config,
          cablingStrategy: currentUi.cablingStrategy,
        },
      },
      result.screens,
      "png",
    );
  });

  refs.btnExportTestCardPdf?.addEventListener("click", () => {
    const currentUi = getUi();
    const currentState = getState();
    const result = computeProject({
      config: currentState.config,
      screens: currentState.screens,
    });
    exportTestCard(
      refs,
      {
        ...currentUi,
        testCardProjectConfig: {
          ...currentState.config,
          cablingStrategy: currentUi.cablingStrategy,
        },
      },
      result.screens,
      "pdf",
    );
  });

  refs.testCardCanvas?.addEventListener("mousedown", (event) => {
    const preview = refs.testCardPreview;
    if (!preview || !(preview.composition?.placements?.length > 0)) return;

    const point = mapMouseToComposition(event, refs.testCardCanvas, preview);
    if (!point) return;

    const hit = findPlacementAtPoint(
      preview.composition.placements,
      point.x,
      point.y,
    );
    if (hit) {
      refs.testCardDrag = {
        screenId: String(hit.screen.id),
        offsetX: point.x - hit.x,
        offsetY: point.y - hit.y,
      };
      setUi({ testCardActivePlacementId: String(hit.screen.id) });
      return;
    }

    refs.testCardPan = {
      lastClientX: event.clientX,
      lastClientY: event.clientY,
    };
  });

  window.addEventListener("mousemove", (event) => {
    const drag = refs.testCardDrag;
    const preview = refs.testCardPreview;
    if (!preview) return;

    const panState = refs.testCardPan;
    if (panState) {
      const ui = getUi();
      const dx = event.clientX - panState.lastClientX;
      const dy = event.clientY - panState.lastClientY;
      refs.testCardPan = {
        lastClientX: event.clientX,
        lastClientY: event.clientY,
      };
      setUi({
        testCardCanvasPanX:
          (ui.testCardCanvasPanX || 0) + dx / Math.max(preview.scale, 0.0001),
        testCardCanvasPanY:
          (ui.testCardCanvasPanY || 0) + dy / Math.max(preview.scale, 0.0001),
      });
      return;
    }

    if (!drag) return;

    const point = mapMouseToComposition(event, refs.testCardCanvas, preview);
    if (!point) return;

    const ui = getUi();
    const positions = { ...(ui.testCardManualPositions || {}) };
    const moving = preview.composition.placements.find(
      (item) => String(item.screen.id) === drag.screenId,
    );
    if (!moving) return;

    const candidate = {
      x: Math.max(0, point.x - drag.offsetX),
      y: Math.max(0, point.y - drag.offsetY),
      width: moving.width,
      height: moving.height,
    };

    // Convert 24 screen pixels to composition pixels for scale-aware snapping
    const scale = Math.max(0.0001, preview.scale);
    const snapThreshold = 24 / scale;
    const gap = Math.max(0, Number(ui.testCardGapPx) || 0);

    const snapped = snapPlacement(
      candidate,
      preview.composition.placements,
      drag.screenId,
      { snapThreshold, gap },
    );

    positions[drag.screenId] = { x: snapped.x, y: snapped.y };
    setUi({ testCardManualPositions: positions, testCardUseAllScreens: false });
  });

  window.addEventListener("mouseup", () => {
    const drag = refs.testCardDrag;
    const preview = refs.testCardPreview;

    // Final snap pass on release so panel lands exactly on the edge
    if (drag && preview?.composition?.placements?.length > 0) {
      const ui = getUi();
      const moving = preview.composition.placements.find(
        (item) => String(item.screen.id) === drag.screenId,
      );
      if (moving) {
        const scale = Math.max(0.0001, preview.scale);
        const snapThreshold = 32 / scale; // slightly wider on release
        const gap = Math.max(0, Number(ui.testCardGapPx) || 0);
        const candidate = {
          x: moving.x,
          y: moving.y,
          width: moving.width,
          height: moving.height,
        };
        const snapped = snapPlacement(
          candidate,
          preview.composition.placements,
          drag.screenId,
          { snapThreshold, gap },
        );
        if (snapped.x !== moving.x || snapped.y !== moving.y) {
          const positions = {
            ...(ui.testCardManualPositions || {}),
            [drag.screenId]: { x: snapped.x, y: snapped.y },
          };
          setUi({
            testCardManualPositions: positions,
            testCardUseAllScreens: false,
          });
        }
      }
    }

    refs.testCardDrag = null;
    refs.testCardPan = null;
  });

  refs.testCardCanvas?.addEventListener("mouseleave", () => {
    refs.testCardDrag = null;
    refs.testCardPan = null;
  });

  refs.testCardCanvas?.addEventListener("wheel", (event) => {
    event.preventDefault();
    const ui = getUi();
    const scaleAmount = 0.1;
    const current = Number(ui.testCardCanvasZoom) || 1;
    const next =
      event.deltaY > 0 ? current - scaleAmount : current + scaleAmount;
    setUi({ testCardCanvasZoom: Math.max(0.1, Math.min(8, next)) });
  });

  refs.btnTestCardZoomIn?.addEventListener("click", () => {
    const ui = getUi();
    const current = Number(ui.testCardCanvasZoom) || 1;
    setUi({ testCardCanvasZoom: Math.min(8, current + 0.2) });
  });

  refs.btnTestCardZoomOut?.addEventListener("click", () => {
    const ui = getUi();
    const current = Number(ui.testCardCanvasZoom) || 1;
    setUi({ testCardCanvasZoom: Math.max(0.1, current - 0.2) });
  });

  refs.btnTestCardZoomReset?.addEventListener("click", () => {
    setUi({
      testCardCanvasZoom: 1,
      testCardCanvasPanX: 0,
      testCardCanvasPanY: 0,
    });
  });

  // Manual position inputs — show position of active panel; allow exact X/Y editing
  refs.testCardPosX?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const ui = getUi();
    const activeId = String(ui.testCardActivePlacementId || "");
    if (!activeId) return;
    const parsed = Number.parseInt(target.value || "0", 10);
    const x = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    const positions = { ...(ui.testCardManualPositions || {}) };
    const current = positions[activeId] || { x: 0, y: 0 };
    positions[activeId] = { ...current, x };
    setUi({ testCardManualPositions: positions, testCardUseAllScreens: false });
  });

  refs.testCardPosY?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const ui = getUi();
    const activeId = String(ui.testCardActivePlacementId || "");
    if (!activeId) return;
    const parsed = Number.parseInt(target.value || "0", 10);
    const y = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    const positions = { ...(ui.testCardManualPositions || {}) };
    const current = positions[activeId] || { x: 0, y: 0 };
    positions[activeId] = { ...current, y };
    setUi({ testCardManualPositions: positions, testCardUseAllScreens: false });
  });

  // Auto-align: clear manual positions so the auto-layout takes full effect
  refs.btnAutoAlignTestCard?.addEventListener("click", () => {
    setUi({ testCardManualPositions: {}, testCardUseAllScreens: false });
  });
}
