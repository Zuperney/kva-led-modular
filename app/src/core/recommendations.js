import { PROCESSOR_CATALOG, TECH_LIMITS } from "./constants.js";

export function recommendProcessor(totalPixels, catalog = PROCESSOR_CATALOG) {
  const pixels = Number(totalPixels) || 0;

  if (pixels <= 0) {
    return {
      type: "none",
      label: "-",
      units: 0,
      limit: 0,
      needsSplit: false,
    };
  }

  const sortedCatalog = [...catalog].sort(
    (a, b) => a.limite_pixels - b.limite_pixels,
  );
  const direct = sortedCatalog.find((item) => pixels <= item.limite_pixels);

  if (direct) {
    return {
      type: "single",
      label: direct.nome,
      units: 1,
      limit: direct.limite_pixels,
      needsSplit: false,
    };
  }

  const maxItem = sortedCatalog[sortedCatalog.length - 1];
  const units = Math.ceil(pixels / maxItem.limite_pixels);

  return {
    type: "multi",
    label: units + "x " + maxItem.nome,
    units,
    limit: maxItem.limite_pixels,
    needsSplit: true,
  };
}

export function estimateRequiredPorts(
  totalPixels,
  pixelsPerPort = TECH_LIMITS.PIXELS_PER_PORT,
) {
  const pixels = Number(totalPixels) || 0;
  if (pixels <= 0) return 0;
  return Math.ceil(pixels / pixelsPerPort);
}
