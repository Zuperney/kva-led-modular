export function buildTestCardComposition(screens, uiState) {
  if (!Array.isArray(screens) || screens.length === 0) return null;

  const selected = resolveTestCardScreens(screens, uiState);
  if (selected.length === 0) return null;

  const gap = Math.max(
    0,
    Number.parseInt(String(uiState.testCardGapPx || 0), 10) || 0,
  );
  const layout =
    selected.length <= 1 ? "single" : uiState.testCardLayout || "horizontal";

  if (selected.length === 1 || layout === "single") {
    const screen = selected[0];
    const width = Math.max(64, Number(screen?.pixels?.largura || 1920));
    const height = Math.max(64, Number(screen?.pixels?.altura || 1080));
    return {
      title: screen.nome || "Tela",
      mode: "single",
      layout: "single",
      gap: 0,
      width,
      height,
      placements: [{ screen, x: 0, y: 0, width, height }],
    };
  }

  let composed;
  if (layout === "vertical") {
    composed = buildVerticalComposition(selected, gap);
  } else if (layout === "grid") {
    const cols = Math.max(
      1,
      Number.parseInt(String(uiState.testCardGridCols || 1), 10) ||
        Math.ceil(Math.sqrt(selected.length)),
    );
    composed = buildGridComposition(selected, gap, cols);
  } else {
    composed = buildHorizontalComposition(selected, gap);
  }

  return applyManualPositions(composed, uiState.testCardManualPositions);
}

function resolveTestCardScreens(screens, uiState) {
  if (uiState.testCardUseAllScreens) {
    return screens.slice();
  }

  const byId = new Map(screens.map((screen) => [String(screen.id), screen]));
  const explicitIds = Array.isArray(uiState.testCardCompositionIds)
    ? uiState.testCardCompositionIds.map(String)
    : [];

  if (explicitIds.length > 0) {
    return explicitIds.map((id) => byId.get(id)).filter(Boolean);
  }

  const selected =
    screens.find(
      (item) => String(item.id) === String(uiState.testCardScreenId),
    ) || screens[0];
  return selected ? [selected] : [];
}

function applyManualPositions(composition, manualPositions) {
  const positions = manualPositions || {};
  const placements = composition.placements.map((item) => {
    const key = String(item.screen.id);
    const manual = positions[key];
    if (!manual) return item;
    const x = Number.isFinite(Number(manual.x)) ? Number(manual.x) : item.x;
    const y = Number.isFinite(Number(manual.y)) ? Number(manual.y) : item.y;
    return {
      ...item,
      x: Math.max(0, x),
      y: Math.max(0, y),
    };
  });

  const bounds = placements.reduce(
    (acc, item) => {
      acc.maxX = Math.max(acc.maxX, item.x + item.width);
      acc.maxY = Math.max(acc.maxY, item.y + item.height);
      return acc;
    },
    { maxX: 0, maxY: 0 },
  );

  return {
    ...composition,
    width: Math.max(64, Math.ceil(bounds.maxX)),
    height: Math.max(64, Math.ceil(bounds.maxY)),
    placements,
  };
}

function buildHorizontalComposition(screens, gap) {
  let x = 0;
  let totalHeight = 0;
  const placements = screens.map((screen) => {
    const width = Math.max(64, Number(screen?.pixels?.largura || 1920));
    const height = Math.max(64, Number(screen?.pixels?.altura || 1080));
    const placement = { screen, x, y: 0, width, height };
    x += width + gap;
    totalHeight = Math.max(totalHeight, height);
    return placement;
  });

  return {
    title: `Composicao (${screens.length} telas)`,
    mode: "compose",
    layout: "horizontal",
    gap,
    width: Math.max(64, x - gap),
    height: Math.max(64, totalHeight),
    placements,
  };
}

function buildVerticalComposition(screens, gap) {
  let y = 0;
  let totalWidth = 0;
  const placements = screens.map((screen) => {
    const width = Math.max(64, Number(screen?.pixels?.largura || 1920));
    const height = Math.max(64, Number(screen?.pixels?.altura || 1080));
    const placement = { screen, x: 0, y, width, height };
    y += height + gap;
    totalWidth = Math.max(totalWidth, width);
    return placement;
  });

  return {
    title: `Composicao (${screens.length} telas)`,
    mode: "compose",
    layout: "vertical",
    gap,
    width: Math.max(64, totalWidth),
    height: Math.max(64, y - gap),
    placements,
  };
}

function buildGridComposition(screens, gap, cols) {
  const rows = Math.ceil(screens.length / cols);
  const colWidths = Array.from({ length: cols }, () => 0);
  const rowHeights = Array.from({ length: rows }, () => 0);

  screens.forEach((screen, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const width = Math.max(64, Number(screen?.pixels?.largura || 1920));
    const height = Math.max(64, Number(screen?.pixels?.altura || 1080));
    colWidths[col] = Math.max(colWidths[col], width);
    rowHeights[row] = Math.max(rowHeights[row], height);
  });

  const xOffsets = [];
  const yOffsets = [];
  let runningX = 0;
  for (let i = 0; i < cols; i++) {
    xOffsets.push(runningX);
    runningX += colWidths[i] + gap;
  }
  let runningY = 0;
  for (let i = 0; i < rows; i++) {
    yOffsets.push(runningY);
    runningY += rowHeights[i] + gap;
  }

  const placements = screens.map((screen, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const width = Math.max(64, Number(screen?.pixels?.largura || 1920));
    const height = Math.max(64, Number(screen?.pixels?.altura || 1080));
    return {
      screen,
      x: xOffsets[col],
      y: yOffsets[row],
      width,
      height,
    };
  });

  return {
    title: `Composicao (${screens.length} telas)`,
    mode: "compose",
    layout: `grid-${cols}col`,
    gap,
    width: Math.max(64, runningX - gap),
    height: Math.max(64, runningY - gap),
    placements,
  };
}
