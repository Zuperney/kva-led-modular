import { buildCablingLayouts } from "../../core/cabling.js";

export function renderCablingView(params) {
  const {
    refs,
    screens,
    config,
    uiState,
    escapeHtml,
    formatInteger,
    formatNumber,
  } = params;

  renderCablingScreenList(
    refs.cablingScreensList,
    screens,
    uiState.selectedScreenId,
    escapeHtml,
  );

  renderCablingCanvas(
    refs.cablingCanvas,
    screens,
    config,
    uiState.selectedScreenId,
    uiState.cablingOrientation,
    uiState.cablingCanvasZoom,
    uiState.cablingCanvasPanX,
    uiState.cablingCanvasPanY,
  );

  renderCablingSummary(
    refs.cablingSummary,
    screens,
    config,
    uiState.selectedScreenId,
    escapeHtml,
    formatInteger,
    formatNumber,
  );
}

function renderCablingScreenList(
  container,
  screens,
  selectedScreenId,
  escapeHtml,
) {
  if (!container) return;
  container.innerHTML = screens
    .map((screen) => {
      const isActive = screen.id === selectedScreenId;
      return (
        '<button class="' +
        (isActive ? "active" : "") +
        '" data-screen-id="' +
        screen.id +
        '">' +
        escapeHtml(screen.nome) +
        "</button>"
      );
    })
    .join("");
}

function renderCablingCanvas(
  canvas,
  screens,
  config,
  selectedScreenId,
  orientation = "horizontal",
  zoom,
  panX,
  panY,
) {
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const screen = screens.find((item) => item.id === selectedScreenId);

  prepareCanvas(canvas, ctx);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#f6f4ef";
  ctx.fillRect(0, 0, width, height);

  if (!screen) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Selecione uma tela para ver o cabeamento.", 20, 30);
    return;
  }

  ctx.save();
  ctx.translate(width / 2 + panX, height / 2 + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);

  const layout = buildCablingLayouts([screen], config)[0];
  if (!layout) {
    ctx.restore();
    return;
  }

  const gap = 2;
  const cabinetAspect = resolveCabinetAspect(screen);
  const unitW = cabinetAspect;
  const unitH = 1;
  const scale = Math.min(
    (width - gap * Math.max(1, layout.cols - 1)) / (layout.cols * unitW),
    (height - gap * Math.max(1, layout.rows - 1)) / (layout.rows * unitH),
  );
  if (!Number.isFinite(scale) || scale <= 0) {
    ctx.restore();
    return;
  }

  const cabinetWidth = unitW * scale;
  const cabinetHeight = unitH * scale;

  const totalGridWidth =
    layout.cols * cabinetWidth + Math.max(0, layout.cols - 1) * gap;
  const totalGridHeight =
    layout.rows * cabinetHeight + Math.max(0, layout.rows - 1) * gap;
  const offsetX = (width - totalGridWidth) / 2;
  const offsetY = (height - totalGridHeight) / 2;

  ctx.fillStyle = "#e8f0ef";
  ctx.strokeStyle = "#1f2933";
  ctx.lineWidth = 1;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x = offsetX + col * (cabinetWidth + gap);
      const y = offsetY + row * (cabinetHeight + gap);
      ctx.fillRect(x, y, cabinetWidth, cabinetHeight);
      ctx.strokeRect(x, y, cabinetWidth, cabinetHeight);
    }
  }

  layout.blocks.forEach((block, blockIndex) => {
    const color = getCableColor(blockIndex);
    ctx.fillStyle = color + "99";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const startX = offsetX + block.x * (cabinetWidth + gap);
    const startY = offsetY + block.y * (cabinetHeight + gap);
    const blockWidth = block.w * cabinetWidth + (block.w - 1) * gap;
    const blockHeight = block.h * cabinetHeight + (block.h - 1) * gap;

    ctx.fillRect(startX, startY, blockWidth, blockHeight);
    ctx.strokeRect(startX, startY, blockWidth, blockHeight);

    const centerX = startX + blockWidth / 2;
    const centerY = startY + blockHeight / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(blockIndex + 1, centerX, centerY);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    if (orientation === "horizontal") {
      for (let row = 0; row < block.h; row++) {
        const rowY = block.y + row;
        const isForward = row % 2 === 0;
        if (isForward) {
          for (let col = 0; col < block.w; col++) {
            const colX = block.x + col;
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
          for (let col = block.w - 1; col >= 0; col--) {
            const colX = block.x + col;
            const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
            const cy =
              offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
            ctx.lineTo(cx, cy);
          }
        }
      }
    } else {
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

function renderCablingSummary(
  container,
  screens,
  config,
  selectedScreenId,
  escapeHtml,
  formatInteger,
  formatNumber,
) {
  if (!container) return;

  const screen = screens.find((item) => item.id === selectedScreenId);
  if (!screen) {
    container.innerHTML =
      '<div class="cabling-summary-item"><span class="cabling-summary-title">Sem tela selecionada</span></div>';
    return;
  }

  const layout = buildCablingLayouts([screen], config)[0];
  if (!layout) return;

  const gabsPerBlock = layout.block.w * layout.block.h;
  const utilization = gabsPerBlock / layout.maxGabsPerCable;

  let statusClass = "safe";
  let statusLabel = "Seguro";

  if (
    config.overclock &&
    gabsPerBlock >
      Math.floor(
        config.pixelsPerPort / (screen.gabinete.px_w * screen.gabinete.px_h),
      )
  ) {
    statusClass = "overclock";
    statusLabel = "Overclock";
  } else if (utilization >= 1) {
    statusClass = "overloaded";
    statusLabel = "Sobrecarga";
  } else if (utilization > 0.85) {
    statusClass = "risk";
    statusLabel = "Alerta";
  }

  const summaryHtml =
    '<div class="cabling-summary-item cabling-summary-item--' +
    statusClass +
    '">' +
    '<span class="cabling-summary-title">' +
    escapeHtml(layout.nome) +
    "</span>" +
    '<span class="cabling-summary-meta">' +
    "Gabinete: " +
    escapeHtml(screen.gabinete?.nome ?? "-") +
    " | Gabinetes: " +
    formatInteger(layout.gabinetes) +
    " | Resolucao: " +
    formatInteger(layout.pixels.largura) +
    " x " +
    formatInteger(layout.pixels.altura) +
    " px" +
    "</span>" +
    '<span class="cabling-summary-meta">' +
    "Cabos estimados: " +
    formatInteger(layout.cables) +
    " | Limite seguro/gab por cabo: " +
    formatInteger(layout.maxGabsPerCable) +
    "</span>" +
    '<div class="cabling-summary-status">' +
    '<span class="cabling-summary-status-label">Status:</span>' +
    '<span class="cabling-summary-status-value">' +
    statusLabel +
    " (" +
    formatNumber(utilization * 100, 0) +
    "%)</span>" +
    "</div>" +
    "</div>";

  container.innerHTML = summaryHtml + renderCablingLegend(layout.blocks);
}

function renderCablingLegend(blocks) {
  const legendHtml = blocks
    .map(
      (_, index) =>
        '<div class="cabling-legend-item">' +
        '<div class="cabling-legend-color" style="background-color: ' +
        getCableColor(index) +
        '"></div>' +
        "<span>Cabo " +
        (index + 1) +
        "</span>" +
        "</div>",
    )
    .join("");

  return '<div class="cabling-legend">' + legendHtml + "</div>";
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

function prepareCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  if (
    canvas.width !== Math.floor(rect.width * dpr) ||
    canvas.height !== Math.floor(rect.height * dpr)
  ) {
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
