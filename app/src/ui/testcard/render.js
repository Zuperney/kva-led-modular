import { buildCablingLayouts } from "../../core/cabling.js";
import { resolveTestCardExportLimits } from "../../core/platform.js";

export function drawTestCardPreview(
  ctx,
  width,
  height,
  composition,
  uiState,
  config,
  activePlacementId,
) {
  if (!ctx || !composition || !uiState)
    return { cardConfig: null, preview: null };
  const cardConfig = {
    preset: uiState.testCardPreset,
    title: uiState.testCardTitle,
    bg: uiState.testCardBg,
    fg: uiState.testCardFg,
    accent: uiState.testCardAccent,
    showGrid: uiState.testCardShowGrid,
    screenName: composition.title,
    resolution: {
      width: composition.width,
      height: composition.height,
    },
  };

  const layout = calcPreviewLayout(
    width,
    height,
    composition,
    Number(uiState.testCardCanvasZoom) || 1,
    Number(uiState.testCardCanvasPanX) || 0,
    Number(uiState.testCardCanvasPanY) || 0,
  );

  // Fill canvas background first (area outside composition bounds)
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = cardConfig.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw test card pattern in composition space so circles/crosshairs/title
  // are centered on the actual composition area, not the canvas viewport.
  const compDisplayW = composition.width * layout.scale;
  const compDisplayH = composition.height * layout.scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.offsetX, layout.offsetY, compDisplayW, compDisplayH);
  ctx.clip();
  ctx.translate(layout.offsetX, layout.offsetY);
  ctx.scale(layout.scale, layout.scale);
  drawTestCard(ctx, composition.width, composition.height, cardConfig);
  ctx.restore();

  // Draw composition frames (screen borders + labels) on top
  drawCompositionFrames(ctx, composition, {
    scaleX: layout.scale,
    scaleY: layout.scale,
    offsetX: layout.offsetX,
    offsetY: layout.offsetY,
    strokeColor: cardConfig.accent,
    labelColor: cardConfig.fg,
    showLabels: true,
    showTargets: uiState.testCardShowTargets !== false,
    showNames: uiState.testCardShowNames !== false,
    showCabling: Boolean(uiState.testCardShowCabling),
    cablingOrientation: uiState.cablingOrientation || "horizontal",
    config,
    activePlacementId,
  });

  return { cardConfig, preview: layout };
}

export function buildTestCardExportCanvas(composition, uiState, config) {
  if (!composition || !uiState) return { canvas: null, exportScale: 1 };
  const exportLimits = resolveTestCardExportLimits();
  const maxDimension = exportLimits.maxDimension;
  const maxArea = exportLimits.maxArea;

  let exportScale = 1;
  if (composition.width > maxDimension || composition.height > maxDimension) {
    exportScale = Math.min(
      maxDimension / composition.width,
      maxDimension / composition.height,
    );
  }

  const scaledArea =
    Math.floor(composition.width * exportScale) *
    Math.floor(composition.height * exportScale);
  if (scaledArea > maxArea) {
    exportScale = Math.min(
      exportScale,
      Math.sqrt(maxArea / (composition.width * composition.height)),
    );
  }

  const width = Math.max(64, Math.floor(composition.width * exportScale));
  const height = Math.max(64, Math.floor(composition.height * exportScale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas: null, exportScale };

  drawTestCard(ctx, width, height, {
    preset: uiState.testCardPreset,
    title: uiState.testCardTitle,
    bg: uiState.testCardBg,
    fg: uiState.testCardFg,
    accent: uiState.testCardAccent,
    showGrid: uiState.testCardShowGrid,
    screenName: composition.title,
    resolution: {
      width: composition.width,
      height: composition.height,
    },
  });

  drawCompositionFrames(ctx, composition, {
    scaleX: width / composition.width,
    scaleY: height / composition.height,
    offsetX: 0,
    offsetY: 0,
    strokeColor: uiState.testCardAccent,
    labelColor: uiState.testCardFg,
    showLabels: true,
    showTargets: uiState.testCardShowTargets !== false,
    showNames: uiState.testCardShowNames !== false,
    showCabling: Boolean(uiState.testCardShowCabling),
    cablingOrientation: uiState.cablingOrientation || "horizontal",
    config,
    activePlacementId: null,
  });

  return { canvas, exportScale };
}

function calcPreviewLayout(
  canvasWidth,
  canvasHeight,
  composition,
  zoom,
  panX,
  panY,
) {
  const margin = Math.max(
    24,
    Math.floor(Math.min(canvasWidth, canvasHeight) * 0.08),
  );
  const contentWidth = canvasWidth - margin * 2;
  const contentHeight = canvasHeight - margin * 2;

  const baseScale = Math.min(
    contentWidth / composition.width,
    contentHeight / composition.height,
  );
  const scale = baseScale * Math.max(0.1, zoom || 1);

  const offsetX =
    (canvasWidth - composition.width * scale) / 2 + (panX || 0) * scale;
  const offsetY =
    (canvasHeight - composition.height * scale) / 2 + (panY || 0) * scale;

  return { scale, offsetX, offsetY };
}

function drawCompositionPreview(
  ctx,
  canvasWidth,
  canvasHeight,
  composition,
  cardConfig,
  activePlacementId,
  zoom,
  panX,
  panY,
) {
  const layout = calcPreviewLayout(
    canvasWidth,
    canvasHeight,
    composition,
    zoom,
    panX,
    panY,
  );

  drawCompositionFrames(ctx, composition, {
    scaleX: layout.scale,
    scaleY: layout.scale,
    offsetX: layout.offsetX,
    offsetY: layout.offsetY,
    strokeColor: cardConfig.accent,
    labelColor: cardConfig.fg,
    showLabels: true,
    showTargets: true,
    activePlacementId,
  });

  return layout;
}

function drawCompositionFrames(ctx, composition, options) {
  const {
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    strokeColor,
    labelColor,
    showLabels,
    showTargets,
    showNames,
    showCabling,
    cablingOrientation,
    config,
    activePlacementId,
  } = options;

  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = labelColor;
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const placements = composition.placements ?? [];
  const overlapIds = findOverlappingPlacementIds(placements);

  placements.forEach((item, index) => {
    const x = offsetX + item.x * scaleX;
    const y = offsetY + item.y * scaleY;
    const width = item.width * scaleX;
    const height = item.height * scaleY;
    const isOverlapping = overlapIds.has(String(item.screen.id));

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = getTestCardColor(index);
    ctx.fillRect(x, y, width, height);

    // Base border to keep screen limits readable over cabling overlays.
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = Math.max(1, Math.min(width, height) * 0.004);
    ctx.strokeRect(x, y, width, height);

    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = isOverlapping
      ? "#dc2626"
      : String(item.screen.id) === String(activePlacementId || "")
        ? "#f97316"
        : strokeColor;
    ctx.lineWidth = isOverlapping
      ? 4
      : String(item.screen.id) === String(activePlacementId || "")
        ? 3
        : 2;
    ctx.strokeRect(x, y, width, height);

    if (isOverlapping) {
      drawOverlapWarningBadge(ctx, x, y, width, height);
    }

    if (showCabling) {
      drawScreenCablingOverlay(ctx, item, {
        x,
        y,
        width,
        height,
        orientation: cablingOrientation,
        config,
      });
    }

    // Center position
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Circle/X markers can be toggled independently for a cleaner view.
    if (showLabels && showTargets) {
      const maxDiameter = Math.min(width, height) * 0.9;
      const radius = maxDiameter / 2;

      // Draw circle
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(2, Math.floor(Math.min(width, height) * 0.01));
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw X inside circle
      const xLineLen = radius * 0.4;
      ctx.beginPath();
      ctx.moveTo(centerX - xLineLen, centerY - xLineLen);
      ctx.lineTo(centerX + xLineLen, centerY + xLineLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + xLineLen, centerY - xLineLen);
      ctx.lineTo(centerX - xLineLen, centerY + xLineLen);
      ctx.stroke();
    }

    if (showLabels && showNames) {
      // Prepare label text
      const label =
        index +
        1 +
        ". " +
        item.screen.nome +
        " (" +
        formatInteger(item.width) +
        "x" +
        formatInteger(item.height) +
        ")";

      const fontSize = Math.max(11, Math.floor(Math.min(width, height) * 0.08));
      ctx.font = `600 ${fontSize}px Segoe UI`;
      const metrics = ctx.measureText(label);
      const textW = metrics.width;
      const textH = fontSize * 1.3;
      const bgPadding = 6;

      // Draw background box behind centered text
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(
        centerX - textW / 2 - bgPadding,
        centerY - textH / 2 - bgPadding,
        textW + bgPadding * 2,
        textH + bgPadding * 2,
      );

      // Draw text centered
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = labelColor;
      ctx.fillText(label, centerX, centerY, Math.max(40, width - 12));
    }
  });
  ctx.restore();
}

function findOverlappingPlacementIds(placements) {
  const overlapIds = new Set();

  for (let index = 0; index < placements.length; index++) {
    const current = placements[index];
    for (
      let otherIndex = index + 1;
      otherIndex < placements.length;
      otherIndex++
    ) {
      const other = placements[otherIndex];
      if (!placementsOverlap(current, other)) continue;
      overlapIds.add(String(current.screen.id));
      overlapIds.add(String(other.screen.id));
    }
  }

  return overlapIds;
}

function placementsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawOverlapWarningBadge(ctx, x, y, width, height) {
  const radius = Math.max(10, Math.min(width, height) * 0.08);
  const badgeX = x + width - radius - 8;
  const badgeY = y + radius + 8;

  ctx.save();
  ctx.globalAlpha = 0.98;
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.max(12, Math.floor(radius * 1.3))}px Segoe UI`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", badgeX, badgeY + 1);
  ctx.restore();
}

function drawScreenCablingOverlay(ctx, placement, options) {
  const { x, y, width, height, orientation, config } = options;
  const screen = placement?.screen;
  if (!screen || !config) return;

  const layout = buildCablingLayouts([screen], config)[0];
  if (!layout) return;

  const gap = 0;
  const cabinetWidth = width / layout.cols;
  const cabinetHeight = height / layout.rows;
  if (
    !Number.isFinite(cabinetWidth) ||
    !Number.isFinite(cabinetHeight) ||
    cabinetWidth <= 0 ||
    cabinetHeight <= 0
  ) {
    return;
  }

  const offsetX = x;
  const offsetY = y;

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#e8f0ef";
  ctx.strokeStyle = "rgba(31,41,51,0.45)";
  ctx.lineWidth = Math.max(0.5, Math.min(width, height) * 0.002);

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const cellX = offsetX + col * (cabinetWidth + gap);
      const cellY = offsetY + row * (cabinetHeight + gap);
      ctx.fillRect(cellX, cellY, cabinetWidth, cabinetHeight);
      ctx.strokeRect(cellX, cellY, cabinetWidth, cabinetHeight);
    }
  }

  layout.blocks.forEach((block, blockIndex) => {
    const color = getCableColor(blockIndex);
    const startX = offsetX + block.x * (cabinetWidth + gap);
    const startY = offsetY + block.y * (cabinetHeight + gap);
    const blockWidth = block.w * cabinetWidth + (block.w - 1) * gap;
    const blockHeight = block.h * cabinetHeight + (block.h - 1) * gap;

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = color;
    ctx.fillRect(startX, startY, blockWidth, blockHeight);

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.min(width, height) * 0.004);
    ctx.strokeRect(startX, startY, blockWidth, blockHeight);

    ctx.beginPath();
    if (orientation === "vertical") {
      for (let col = 0; col < block.w; col++) {
        const colX = block.x + col;
        const isDownward = col % 2 === 0;
        if (isDownward) {
          for (let row = 0; row < block.h; row++) {
            const rowY = block.y + row;
            const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
            const cy =
              offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
            if (col === 0 && row === 0) {
              ctx.moveTo(cx, cy);
            } else {
              ctx.lineTo(cx, cy);
            }
          }
        } else {
          for (let row = block.h - 1; row >= 0; row--) {
            const rowY = block.y + row;
            const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
            const cy =
              offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
            ctx.lineTo(cx, cy);
          }
        }
      }
    } else {
      for (let row = 0; row < block.h; row++) {
        const rowY = block.y + row;
        const isForward = row % 2 === 0;
        if (isForward) {
          for (let col = 0; col < block.w; col++) {
            const colX = block.x + col;
            const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
            const cy =
              offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
            if (row === 0 && col === 0) {
              ctx.moveTo(cx, cy);
            } else {
              ctx.lineTo(cx, cy);
            }
          }
        } else {
          for (let col = block.w - 1; col >= 0; col--) {
            const colX = block.x + col;
            const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
            const cy =
              offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
            ctx.lineTo(cx, cy);
          }
        }
      }
    }
    ctx.stroke();
  });

  ctx.restore();
}

function resolveCabinetAspect(screen) {
  const g = screen?.gabinete;
  const pxW = Number(g?.px_w);
  const pxH = Number(g?.px_h);
  const mmW = Number(g?.l_mm);
  const mmH = Number(g?.a_mm);

  const pxAspect =
    Number.isFinite(pxW) && Number.isFinite(pxH) && pxW > 0 && pxH > 0
      ? pxW / pxH
      : null;
  const mmAspect =
    Number.isFinite(mmW) && Number.isFinite(mmH) && mmW > 0 && mmH > 0
      ? mmW / mmH
      : null;

  const screenPxW = Number(screen?.pixels?.largura);
  const screenPxH = Number(screen?.pixels?.altura);
  const screenAspect =
    Number.isFinite(screenPxW) &&
    Number.isFinite(screenPxH) &&
    screenPxW > 0 &&
    screenPxH > 0
      ? screenPxW / screenPxH
      : null;

  if (screenAspect && pxAspect && mmAspect) {
    const pxDiff = Math.abs(pxAspect - screenAspect);
    const mmDiff = Math.abs(mmAspect - screenAspect);
    return pxDiff <= mmDiff ? pxAspect : mmAspect;
  }

  if (pxAspect) return pxAspect;
  if (mmAspect) return mmAspect;

  return 1;
}

function getCableColor(index) {
  const palette = [
    "#2563eb",
    "#22c55e",
    "#f97316",
    "#06b6d4",
    "#f43f5e",
    "#a855f7",
    "#eab308",
    "#0ea5e9",
    "#16a34a",
    "#fb7185",
  ];

  return palette[index % palette.length];
}

function drawTestCard(ctx, width, height, config) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, width, height);

  const margin = Math.max(18, Math.floor(Math.min(width, height) * 0.04));
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;

  if (config.showGrid) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    for (
      let x = margin;
      x <= width - margin;
      x += Math.max(24, Math.floor(innerW / 24))
    ) {
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }
    for (
      let y = margin;
      y <= height - margin;
      y += Math.max(24, Math.floor(innerH / 16))
    ) {
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (config.preset === "colorbars") {
    drawColorBars(ctx, margin, width, height);
  } else if (config.preset === "grid") {
    drawFocusGrid(ctx, margin, width, height, config.fg, config.accent);
  } else if (config.preset === "focus") {
    drawFocusMarks(ctx, margin, width, height, config.fg, config.accent);
  } else {
    drawClassicCard(ctx, margin, width, height, config.fg, config.accent);
  }

  ctx.save();
  ctx.strokeStyle = config.fg;
  ctx.lineWidth = Math.max(2, Math.floor(Math.min(width, height) * 0.006));
  ctx.strokeRect(margin, margin, innerW, innerH);
  ctx.restore();

  ctx.fillStyle = config.fg;
  ctx.font = `700 ${Math.max(18, Math.floor(height * 0.06))}px "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    config.title || "LED TEST CARD",
    width / 2,
    margin + Math.floor(height * 0.12),
  );

  ctx.fillStyle = config.accent;
  ctx.font = `600 ${Math.max(12, Math.floor(height * 0.032))}px "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${config.screenName} | ${formatInteger(config.resolution.width)} x ${formatInteger(config.resolution.height)} px`,
    width / 2,
    margin + Math.floor(height * 0.2),
  );
}

function drawClassicCard(ctx, margin, width, height, fg, accent) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.34;

  ctx.save();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 2;
  [0.25, 0.5, 0.75, 1].forEach((factor) => {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * factor, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(margin, cy);
  ctx.lineTo(width - margin, cy);
  ctx.moveTo(cx, margin);
  ctx.lineTo(cx, height - margin);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = accent;
  const boxW = Math.floor((width - margin * 2) / 10);
  const boxH = Math.max(16, Math.floor(height * 0.05));
  for (let i = 0; i < 10; i++) {
    ctx.globalAlpha = 0.2 + i * 0.08;
    ctx.fillRect(
      margin + i * boxW,
      height - margin - boxH - 20,
      boxW - 2,
      boxH,
    );
  }
  ctx.restore();
}

function drawFocusGrid(ctx, margin, width, height, fg, accent) {
  ctx.save();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 1.5;
  const cols = 12;
  const rows = 8;
  for (let c = 0; c <= cols; c++) {
    const x = margin + ((width - margin * 2) * c) / cols;
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, height - margin);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    const y = margin + ((height - margin * 2) * r) / rows;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = accent;
  ctx.fillRect(width / 2 - 8, margin + 8, 16, 16);
  ctx.fillRect(width / 2 - 8, height - margin - 24, 16, 16);
  ctx.fillRect(margin + 8, height / 2 - 8, 16, 16);
  ctx.fillRect(width - margin - 24, height / 2 - 8, 16, 16);
  ctx.restore();
}

function drawFocusMarks(ctx, margin, width, height, fg, accent) {
  ctx.save();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 3;
  const len = Math.max(22, Math.floor(Math.min(width, height) * 0.08));
  const points = [
    [margin, margin, 1, 1],
    [width - margin, margin, -1, 1],
    [margin, height - margin, 1, -1],
    [width - margin, height - margin, -1, -1],
  ];
  points.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * len, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(width / 2 - len, height / 2);
  ctx.lineTo(width / 2 + len, height / 2);
  ctx.moveTo(width / 2, height / 2 - len);
  ctx.lineTo(width / 2, height / 2 + len);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.max(8, len * 0.16), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawColorBars(ctx, margin, width, height) {
  const bars = [
    "#ffffff",
    "#facc15",
    "#22d3ee",
    "#22c55e",
    "#f97316",
    "#ef4444",
    "#2563eb",
    "#111827",
  ];
  const barAreaH = Math.floor((height - margin * 2) * 0.48);
  const barW = (width - margin * 2) / bars.length;
  bars.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      margin + index * barW,
      margin + Math.floor(height * 0.2),
      barW,
      barAreaH,
    );
  });

  const graySteps = 12;
  const grayW = (width - margin * 2) / graySteps;
  for (let i = 0; i < graySteps; i++) {
    const tone = Math.floor((255 * i) / (graySteps - 1));
    ctx.fillStyle = `rgb(${tone}, ${tone}, ${tone})`;
    ctx.fillRect(
      margin + i * grayW,
      height - margin - Math.floor(height * 0.16),
      grayW,
      Math.floor(height * 0.1),
    );
  }
}

function getTestCardColor(index) {
  const palette = [
    "#2563eb",
    "#22c55e",
    "#f97316",
    "#06b6d4",
    "#f43f5e",
    "#a855f7",
    "#eab308",
    "#0ea5e9",
    "#16a34a",
    "#fb7185",
  ];
  return palette[index % palette.length];
}

function formatInteger(value) {
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
