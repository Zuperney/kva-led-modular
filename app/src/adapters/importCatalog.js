import { DEFAULTS } from "../core/constants.js";

/**
 * Parser unico para catalogo de gabinetes em TXT/CSV.
 * Suporta delimitadores ';', ',' e tab.
 *
 * Colunas esperadas:
 * nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
 */
export function parseCatalogText(text) {
  if (typeof text !== "string") {
    throw new TypeError("Conteudo do catalogo deve ser string.");
  }

  const lines = text.split(/\r?\n/);
  const cabinets = [];
  const skipped = [];

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || line.startsWith("//")) {
      return;
    }

    const delimiter = detectDelimiter(line);
    const parts = line.split(delimiter).map((item) => item.trim());

    if (isHeaderLine(parts)) {
      return;
    }

    const parsed = parseCatalogParts(parts, lineNumber);
    if (!parsed.ok) {
      skipped.push({ line: lineNumber, reason: parsed.reason });
      return;
    }

    cabinets.push(parsed.value);
  });

  return {
    cabinets,
    skipped,
    totalLines: lines.length,
    parsedCount: cabinets.length,
  };
}

/**
 * Parser para import de catalogo em TXT/CSV/JSON.
 * JSON suportado:
 * - template.gabinetes.v1
 * - array direto de gabinetes
 * - objeto com propriedade "gabinetes"
 */
export function parseCatalogInput(text) {
  if (typeof text !== "string") {
    throw new TypeError("Conteudo do catalogo deve ser string.");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      cabinets: [],
      skipped: [],
      totalLines: 0,
      parsedCount: 0,
    };
  }

  if (looksLikeJson(trimmed)) {
    return parseCatalogJson(trimmed);
  }

  return parseCatalogText(text);
}

export function parseCatalogParts(parts, lineNumber = null) {
  if (!Array.isArray(parts) || parts.length < 7) {
    return {
      ok: false,
      reason: lineReason(lineNumber, "campos insuficientes"),
    };
  }

  const nome = String(parts[0] ?? "").trim();
  const larguraMm = toPositiveInt(parts[1]);
  const alturaMm = toPositiveInt(parts[2]);
  const pxW = toPositiveInt(parts[3]);
  const pxH = toPositiveInt(parts[4]);
  const pesoKg = toPositiveNumber(parts[5]);
  const wattsMax = toPositiveNumber(parts[6]);
  const fp = resolvePowerFactor(parts[7]);

  if (!nome) return { ok: false, reason: lineReason(lineNumber, "nome vazio") };
  if (!Number.isInteger(larguraMm))
    return { ok: false, reason: lineReason(lineNumber, "largura_mm invalida") };
  if (!Number.isInteger(alturaMm))
    return { ok: false, reason: lineReason(lineNumber, "altura_mm invalida") };
  if (!Number.isInteger(pxW))
    return { ok: false, reason: lineReason(lineNumber, "px_w invalido") };
  if (!Number.isInteger(pxH))
    return { ok: false, reason: lineReason(lineNumber, "px_h invalido") };
  if (!Number.isFinite(pesoKg))
    return { ok: false, reason: lineReason(lineNumber, "peso_kg invalido") };
  if (!Number.isFinite(wattsMax))
    return { ok: false, reason: lineReason(lineNumber, "watts_max invalido") };

  return {
    ok: true,
    value: {
      nome,
      largura_mm: larguraMm,
      altura_mm: alturaMm,
      px_w: pxW,
      px_h: pxH,
      peso_kg: pesoKg,
      watts_max: wattsMax,
      fp,
    },
  };
}

export function detectDelimiter(line) {
  if (line.includes(";")) return ";";
  if (line.includes("\t")) return "\t";
  return ",";
}

export function isHeaderLine(parts) {
  const normalized = parts.join(";").toLowerCase();
  return (
    normalized.includes("nome") &&
    normalized.includes("largura") &&
    normalized.includes("altura")
  );
}

function parseCatalogJson(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON invalido no catalogo.");
  }

  const list = extractCabinetList(parsed);
  const cabinets = [];
  const skipped = [];

  list.forEach((item, index) => {
    const lineNumber = index + 1;
    const normalizedParts = [
      item?.nome,
      item?.largura_mm,
      item?.altura_mm,
      item?.px_w,
      item?.px_h,
      item?.peso_kg,
      item?.watts_max,
      item?.fp,
    ];

    const parsedCabinet = parseCatalogParts(normalizedParts, lineNumber);
    if (!parsedCabinet.ok) {
      skipped.push({ line: lineNumber, reason: parsedCabinet.reason });
      return;
    }

    cabinets.push(parsedCabinet.value);
  });

  return {
    cabinets,
    skipped,
    totalLines: list.length,
    parsedCount: cabinets.length,
  };
}

function extractCabinetList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    throw new Error("Formato de catalogo invalido.");
  }

  if (Array.isArray(value.gabinetes)) {
    return value.gabinetes;
  }

  throw new Error("JSON de catalogo sem lista de gabinetes.");
}

function looksLikeJson(value) {
  return value.startsWith("{") || value.startsWith("[");
}

function resolvePowerFactor(value) {
  const parsed = Number.parseFloat(normalizeNumber(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS.POWER_FACTOR;
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(normalizeNumber(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function toPositiveNumber(value) {
  const parsed = Number.parseFloat(normalizeNumber(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
}

function normalizeNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(",", ".");
}

function lineReason(lineNumber, reason) {
  return lineNumber ? "linha " + lineNumber + ": " + reason : reason;
}
