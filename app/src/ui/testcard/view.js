import { buildTestCardComposition } from "./composition.js";
import { drawTestCardPreview } from "./render.js";

export function renderTestCardView(params) {
  const { refs, screens, uiState, config, escapeHtml, formatInteger } = params;
  const canvas = refs.testCardCanvas;
  if (!(canvas instanceof HTMLCanvasElement)) return;

  syncTestCardControls(refs, screens, uiState, escapeHtml, formatInteger);

  const composition = buildTestCardComposition(screens, uiState);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Sync canvas buffer to CSS display size.
  // If they differ, clearRect won't cover the full buffer → trails on the right/bottom.
  // Setting canvas.width also resets the drawing context cleanly.
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  if (!composition) {
    refs.testCardPreview = null;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#6b7280";
    ctx.font = "600 14px Segoe UI";
    ctx.fillText("Cadastre telas para compor o test card.", 20, 28);
    if (refs.testCardMeta) {
      refs.testCardMeta.innerHTML =
        '<div class="cabling-summary-item"><span class="cabling-summary-title">Sem telas</span></div>';
    }
    return;
  }

  const { preview } = drawTestCardPreview(
    ctx,
    width,
    height,
    composition,
    uiState,
    config,
    String(uiState.testCardActivePlacementId || ""),
  );
  refs.testCardPreview = {
    ...preview,
    composition,
    canvasWidth: width,
    canvasHeight: height,
  };

  if (refs.testCardMeta) {
    const overlappingIds = collectOverlappingPlacementIds(
      composition.placements,
    );
    const screensHtml = composition.placements
      .map(
        (item, index) =>
          '<span class="cabling-summary-meta">' +
          "#" +
          (index + 1) +
          " " +
          escapeHtml(item.screen.nome) +
          ": " +
          formatInteger(item.width) +
          " x " +
          formatInteger(item.height) +
          " px (x=" +
          formatInteger(item.x) +
          ", y=" +
          formatInteger(item.y) +
          ")</span>",
      )
      .join("");

    const overlapWarning = overlappingIds.size
      ? '<span class="cabling-summary-meta" style="color:#b91c1c;font-weight:700;">Atencao: existe sobreposicao entre telas na composicao.</span>'
      : "";

    refs.testCardMeta.innerHTML =
      '<div class="cabling-summary-item">' +
      '<span class="cabling-summary-title">' +
      escapeHtml(composition.title) +
      "</span>" +
      '<span class="cabling-summary-meta">Resolucao: ' +
      formatInteger(composition.width) +
      " x " +
      formatInteger(composition.height) +
      " px | Layout: " +
      escapeHtml(composition.layout) +
      " | Gap: " +
      formatInteger(composition.gap) +
      " px" +
      "</span>" +
      overlapWarning +
      screensHtml +
      "</div>";
  }
}

function collectOverlappingPlacementIds(placements) {
  const overlapIds = new Set();

  for (let index = 0; index < placements.length; index++) {
    const current = placements[index];
    for (
      let otherIndex = index + 1;
      otherIndex < placements.length;
      otherIndex++
    ) {
      const other = placements[otherIndex];
      const overlaps =
        current.x < other.x + other.width &&
        current.x + current.width > other.x &&
        current.y < other.y + other.height &&
        current.y + current.height > other.y;
      if (!overlaps) continue;
      overlapIds.add(String(current.screen.id));
      overlapIds.add(String(other.screen.id));
    }
  }

  return overlapIds;
}

function syncTestCardControls(
  refs,
  screens,
  uiState,
  escapeHtml,
  formatInteger,
) {
  if (refs.testCardSelectedScreens instanceof HTMLElement) {
    const selectedIds = uiState.testCardUseAllScreens
      ? screens.map((screen) => String(screen.id))
      : Array.isArray(uiState.testCardCompositionIds)
        ? uiState.testCardCompositionIds.map(String)
        : [];
    const byId = new Map(screens.map((screen) => [String(screen.id), screen]));
    const chipsHtml = selectedIds
      .map((screenId, index) => {
        const screen = byId.get(screenId);
        if (!screen) return "";
        const isActive =
          String(uiState.testCardActivePlacementId || "") === screenId;
        return (
          '<button type="button" class="testcard-screen-chip' +
          (isActive ? " active" : "") +
          '" data-screen-id="' +
          escapeHtml(screenId) +
          '" data-action="select" title="Clique para selecionar">' +
          '<span class="chip-order">' +
          (index + 1) +
          ".</span>" +
          '<span class="chip-name">' +
          escapeHtml(screen.nome) +
          "</span>" +
          '<span class="chip-meta">' +
          formatInteger(screen.pixels.largura) +
          "x" +
          formatInteger(screen.pixels.altura) +
          "</span>" +
          '<span class="chip-remove" data-screen-id="' +
          escapeHtml(screenId) +
          '" data-action="remove" title="Remover">x</span>' +
          "</button>"
        );
      })
      .join("");

    refs.testCardSelectedScreens.innerHTML =
      chipsHtml ||
      '<div class="notice" style="margin:0;">Nenhuma tela adicionada ao canvas. Use "Adicionar/remover telas" para montar a composicao.</div>';
  }

  const manageScreensList = document.getElementById(
    "testCardManageScreensList",
  );
  if (manageScreensList instanceof HTMLElement) {
    const selectedIds = uiState.testCardUseAllScreens
      ? screens.map((screen) => String(screen.id))
      : Array.isArray(uiState.testCardCompositionIds)
        ? uiState.testCardCompositionIds.map(String)
        : [];
    const selectedSet = new Set(selectedIds);

    const manageHtml = screens
      .map((screen, index) => {
        const screenId = String(screen.id);
        const inComposition = selectedSet.has(screenId);

        return (
          '<div class="testcard-manage-chip' +
          (inComposition ? " is-in-composition" : "") +
          '">' +
          '<button type="button" class="testcard-manage-main" data-action="' +
          (inComposition ? "noop" : "add-from-modal") +
          '" data-screen-id="' +
          escapeHtml(screenId) +
          '" title="' +
          (inComposition
            ? "Tela ja esta na composicao"
            : "Clique para adicionar") +
          '">' +
          '<span class="chip-order">' +
          (index + 1) +
          ".</span>" +
          '<span class="chip-name">' +
          escapeHtml(screen.nome) +
          '<span class="chip-meta">' +
          formatInteger(screen.pixels.largura) +
          "x" +
          formatInteger(screen.pixels.altura) +
          " px</span>" +
          "</span>" +
          "</button>" +
          (inComposition
            ? '<button type="button" class="testcard-manage-remove" data-action="remove-from-modal" data-screen-id="' +
              escapeHtml(screenId) +
              '" title="Remover da composicao">x</button>'
            : "") +
          "</div>"
        );
      })
      .join("");

    manageScreensList.innerHTML =
      manageHtml ||
      '<div class="notice" style="margin:0;">Nenhuma tela cadastrada no projeto.</div>';
  }

  if (refs.testCardPreset instanceof HTMLSelectElement) {
    refs.testCardPreset.value = uiState.testCardPreset || "classic";
  }
  if (refs.testCardUseAllScreens instanceof HTMLInputElement) {
    refs.testCardUseAllScreens.checked = Boolean(uiState.testCardUseAllScreens);
  }
  const testCardLayoutMenuUseAll = document.getElementById(
    "testCardLayoutMenuUseAll",
  );
  if (testCardLayoutMenuUseAll instanceof HTMLInputElement) {
    testCardLayoutMenuUseAll.checked = Boolean(uiState.testCardUseAllScreens);
  }
  const testCardLayoutQuick = document.getElementById("testCardLayoutQuick");
  if (testCardLayoutQuick instanceof HTMLElement) {
    const currentLayout = String(uiState.testCardLayout || "horizontal");
    testCardLayoutQuick
      .querySelectorAll("button[data-layout-value]")
      .forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        node.classList.toggle(
          "is-active",
          String(node.dataset.layoutValue || "") === currentLayout,
        );
      });
  }
  if (refs.testCardGapPx instanceof HTMLInputElement) {
    refs.testCardGapPx.value = String(
      Math.max(0, Number(uiState.testCardGapPx) || 0),
    );
  }
  const testCardLayoutMenuGapPx = document.getElementById(
    "testCardLayoutMenuGapPx",
  );
  if (testCardLayoutMenuGapPx instanceof HTMLInputElement) {
    testCardLayoutMenuGapPx.value = String(
      Math.max(0, Number(uiState.testCardGapPx) || 0),
    );
  }
  if (refs.testCardGridCols instanceof HTMLInputElement) {
    refs.testCardGridCols.value = String(
      Math.max(1, Number(uiState.testCardGridCols) || 1),
    );
  }
  const testCardLayoutMenuGridCols = document.getElementById(
    "testCardLayoutMenuGridCols",
  );
  if (testCardLayoutMenuGridCols instanceof HTMLInputElement) {
    testCardLayoutMenuGridCols.value = String(
      Math.max(1, Number(uiState.testCardGridCols) || 1),
    );
  }
  if (refs.testCardTitle instanceof HTMLInputElement) {
    refs.testCardTitle.value = uiState.testCardTitle || "LED TEST CARD";
  }
  if (refs.testCardBg instanceof HTMLInputElement) {
    refs.testCardBg.value = uiState.testCardBg || "#0f172a";
    syncPaletteSelection(refs.testCardBg.id, refs.testCardBg.value);
  }
  if (refs.testCardFg instanceof HTMLInputElement) {
    refs.testCardFg.value = uiState.testCardFg || "#e5e7eb";
    syncPaletteSelection(refs.testCardFg.id, refs.testCardFg.value);
  }
  if (refs.testCardAccent instanceof HTMLInputElement) {
    refs.testCardAccent.value = uiState.testCardAccent || "#22d3ee";
    syncPaletteSelection(refs.testCardAccent.id, refs.testCardAccent.value);
  }
  if (refs.testCardShowGrid instanceof HTMLInputElement) {
    refs.testCardShowGrid.checked = Boolean(uiState.testCardShowGrid);
  }
  if (refs.testCardShowCabling instanceof HTMLInputElement) {
    refs.testCardShowCabling.checked = Boolean(uiState.testCardShowCabling);
  }
  if (refs.testCardShowNames instanceof HTMLInputElement) {
    refs.testCardShowNames.checked = uiState.testCardShowNames !== false;
  }
  if (refs.testCardShowTargets instanceof HTMLInputElement) {
    refs.testCardShowTargets.checked = uiState.testCardShowTargets !== false;
  }

  // Sync style submenu toggle icons
  const testCardStyleSubmenu = document.getElementById("testCardStyleSubmenu");
  if (testCardStyleSubmenu instanceof HTMLElement) {
    const toggleMap = {
      testCardShowGrid: "btnTestCardShowGrid",
      testCardShowCabling: "btnTestCardShowCabling",
      testCardShowNames: "btnTestCardShowNames",
      testCardShowTargets: "btnTestCardShowTargets",
    };

    Object.entries(toggleMap).forEach(([uiKey, btnId]) => {
      const btn = document.getElementById(btnId);
      const isChecked = uiState[uiKey] !== false;
      if (btn instanceof HTMLButtonElement) {
        btn.setAttribute("aria-pressed", isChecked ? "true" : "false");
        btn.classList.toggle("is-active", isChecked);
      }
    });

    // Sync color swatches in submenu
    const colorPalettes = testCardStyleSubmenu.querySelectorAll(
      "[data-color-palette]",
    );
    colorPalettes.forEach((palette) => {
      const paletteId = palette.dataset.colorPalette || "";
      const colorStateMap = {
        testCardBg: uiState.testCardBg || "#0f172a",
        testCardFg: uiState.testCardFg || "#e5e7eb",
        testCardAccent: uiState.testCardAccent || "#22d3ee",
      };
      const selectedColor = colorStateMap[paletteId];
      if (!selectedColor) return;
      syncPaletteSelection(paletteId, selectedColor);
    });
  }

  // Sync manual position inputs for the active panel
  const activeId = String(uiState.testCardActivePlacementId || "");
  const manualPos = uiState.testCardManualPositions?.[activeId];
  const posX = manualPos ? Number(manualPos.x) : 0;
  const posY = manualPos ? Number(manualPos.y) : 0;

  if (refs.testCardPosX instanceof HTMLInputElement) {
    refs.testCardPosX.value = String(Math.max(0, Math.round(posX)));
    refs.testCardPosX.disabled = !activeId;
  }
  if (refs.testCardPosY instanceof HTMLInputElement) {
    refs.testCardPosY.value = String(Math.max(0, Math.round(posY)));
    refs.testCardPosY.disabled = !activeId;
  }

  function syncPaletteSelection(inputId, value) {
    const palette = document.querySelector(`[data-color-palette="${inputId}"]`);
    if (!(palette instanceof HTMLElement)) return;

    const normalized = String(value || "").toLowerCase();
    const swatches = palette.querySelectorAll(".testcard-color-swatch");
    swatches.forEach((swatch) => {
      const button = swatch;
      if (!(button instanceof HTMLElement)) return;
      const candidate = String(button.dataset.color || "").toLowerCase();
      button.classList.toggle("active", candidate === normalized);
    });
  }
}
