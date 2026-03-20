import { TECH_LIMITS } from "./constants.js";

/**
 * Contrato de entrada minimo por tela:
 * {
 *   id, nome,
 *   quantidade_colunas,
 *   quantidade_linhas,
 *   gabinete: { px_w, px_h },
 *   pixels?: { largura, altura, totais }
 * }
 *
 * Contrato de saida por tela:
 * {
 *   id, nome, cols, rows, gabinetes,
 *   pixels: { largura, altura, totais },
 *   maxGabsPerCable, block: { w, h },
 *   blocks: [{ x, y, w, h }],
 *   cables, ports
 * }
 */
export function buildCablingLayouts(screens = [], config = {}) {
  if (!Array.isArray(screens)) return [];
  return screens.map((screen) =>
    buildCablingLayoutFromScreen(screen, config),
  );
}

export function buildCablingLayoutFromScreen(screen, config = {}) {
  const {
    cablingStrategy = "largura",
    pixelsPerPort = TECH_LIMITS.PIXELS_PER_PORT,
    overclock = false,
  } = config;
  const cols = toPositiveInt(screen?.quantidade_colunas, 1);
  const rows = toPositiveInt(screen?.quantidade_linhas, 1);

  const pxPerGab = Math.max(
    1,
    Number(screen?.gabinete?.px_w || 0) * Number(screen?.gabinete?.px_h || 0),
  );
  
  const roundingFn = overclock ? Math.ceil : Math.floor;
  const maxGabsPerCable = Math.max(
    1,
    roundingFn(pixelsPerPort / pxPerGab),
  );

  const block = findBestBlock(cols, rows, maxGabsPerCable, cablingStrategy);
  const blocks = generateCablingBlocks(
    cols,
    rows,
    block.w,
    block.h,
    maxGabsPerCable,
  );

  const pxLargura =
    Number(screen?.pixels?.largura) ||
    cols * Number(screen?.gabinete?.px_w || 0);
  const pxAltura =
    Number(screen?.pixels?.altura) ||
    rows * Number(screen?.gabinete?.px_h || 0);
  const pxTotais = Number(screen?.pixels?.totais) || pxLargura * pxAltura;

  return {
    id: screen?.id,
    nome: String(screen?.nome || "Tela"),
    cols,
    rows,
    gabinetes: cols * rows,
    pixels: {
      largura: pxLargura,
      altura: pxAltura,
      totais: pxTotais,
    },
    maxGabsPerCable,
    block,
    blocks,
    cables: blocks.length,
    ports: Math.ceil(pxTotais / pixelsPerPort),
  };
}

export function findBestBlock(totalW, totalH, maxGabsPerCable, strategy) {
  let best = {
    w: 1,
    h: 1,
    cables: Number.POSITIVE_INFINITY,
    diff: Number.POSITIVE_INFINITY,
    area: 0,
  };

  if (strategy === "largura") {
    for (let w = 1; w <= totalW; w++) {
      const h = Math.min(totalH, Math.floor(maxGabsPerCable / w));
      if (h === 0) continue;
      const blocks = generateCablingBlocks(totalW, totalH, w, h, maxGabsPerCable);
      const cables = blocks.length;
      if (cables < best.cables) {
        best = { w, h, cables, diff: Math.abs(w - h), area: w * h };
      }
    }
  } else if (strategy === "altura") {
    for (let h = 1; h <= totalH; h++) {
      const w = Math.min(totalW, Math.floor(maxGabsPerCable / h));
      if (w === 0) continue;
      const blocks = generateCablingBlocks(totalW, totalH, w, h, maxGabsPerCable);
      const cables = blocks.length;
      if (cables < best.cables) {
        best = { w, h, cables, diff: Math.abs(w - h), area: w * h };
      }
    }
  } else {
    // area
    for (let w = 1; w <= totalW && w <= maxGabsPerCable; w += 1) {
      let h = Math.floor(maxGabsPerCable / w);
      h = Math.min(h, totalH);
      if (h < 1) continue;

      const blocks = generateCablingBlocks(totalW, totalH, w, h, maxGabsPerCable);
      const cables = blocks.length;
      const diff = Math.abs(w - h);
      const area = w * h;

      if (cables < best.cables) {
        best = { w, h, cables, diff, area };
      } else if (cables === best.cables) {
        if (area > best.area) {
          best = { w, h, cables, diff, area };
        } else if (area === best.area && diff < best.diff) {
          best = { w, h, cables, diff, area };
        }
      }
    }
  }

  return { w: best.w, h: best.h };
}

export function generateCablingBlocks(
  totalW,
  totalH,
  blockW,
  blockH,
  maxGabsPerCable,
) {
  if (blockW === 0 || blockH === 0) return [];
  const blocks = [];
  const colsMain = Math.floor(totalW / blockW);
  const rowsMain = Math.floor(totalH / blockH);

  for (let row = 0; row < rowsMain; row += 1) {
    for (let col = 0; col < colsMain; col += 1) {
      blocks.push({ x: col * blockW, y: row * blockH, w: blockW, h: blockH });
    }
  }

  const usedWidth = colsMain * blockW;
  const usedHeight = rowsMain * blockH;
  const restW = totalW - usedWidth;
  const restH = totalH - usedHeight;

  if (restW > 0) {
    splitVerticalZone(blocks, usedWidth, 0, restW, usedHeight, maxGabsPerCable);
  }

  if (restH > 0) {
    splitHorizontalZone(blocks, 0, usedHeight, totalW, restH, maxGabsPerCable);
  }

  return blocks;
}

export function splitVerticalZone(
  blocks,
  startX,
  startY,
  width,
  totalH,
  maxGabsPerCable,
) {
  if (!width || !totalH) return;
  const maxRows = Math.max(1, Math.floor(maxGabsPerCable / width));
  let y = 0;
  while (y < totalH) {
    const h = Math.min(maxRows, totalH - y);
    blocks.push({ x: startX, y: startY + y, w: width, h });
    y += h;
  }
}

export function splitHorizontalZone(
  blocks,
  startX,
  startY,
  totalW,
  height,
  maxGabsPerCable,
) {
  if (!height || !totalW) return;
  const maxCols = Math.max(1, Math.floor(maxGabsPerCable / height));
  let x = 0;
  while (x < totalW) {
    const w = Math.min(maxCols, totalW - x);
    blocks.push({ x: startX + x, y: startY, w, h: height });
    x += w;
  }
}

function toPositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
