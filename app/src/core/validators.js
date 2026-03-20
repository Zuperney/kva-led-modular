import { DEFAULTS } from "./constants.js";
import {
  toPositiveInt,
  toPositiveNumber,
  resolvePowerFactor,
} from "./parsers.js";

export function validateCabinet(cabinet, label = "gabinete") {
  const errors = [];
  const normalized = {
    nome: String(cabinet?.nome ?? "").trim(),
    largura_mm: toPositiveInt(cabinet?.largura_mm),
    altura_mm: toPositiveInt(cabinet?.altura_mm),
    px_w: toPositiveInt(cabinet?.px_w),
    px_h: toPositiveInt(cabinet?.px_h),
    peso_kg: toPositiveNumber(cabinet?.peso_kg),
    watts_max: toPositiveNumber(cabinet?.watts_max),
    fp: resolvePowerFactor(cabinet?.fp),
  };

  if (!normalized.nome) errors.push(label + ".nome invalido");
  if (!Number.isInteger(normalized.largura_mm))
    errors.push(label + ".largura_mm invalido");
  if (!Number.isInteger(normalized.altura_mm))
    errors.push(label + ".altura_mm invalido");
  if (!Number.isInteger(normalized.px_w)) errors.push(label + ".px_w invalido");
  if (!Number.isInteger(normalized.px_h)) errors.push(label + ".px_h invalido");
  if (!Number.isFinite(normalized.peso_kg))
    errors.push(label + ".peso_kg invalido");
  if (!Number.isFinite(normalized.watts_max))
    errors.push(label + ".watts_max invalido");

  return {
    ok: errors.length === 0,
    errors,
    value: normalized,
  };
}

export function validateScreen(screen, index = 0) {
  const errors = [];
  const cols = toPositiveInt(screen?.quantidade_colunas ?? screen?.cols);
  const rows = toPositiveInt(screen?.quantidade_linhas ?? screen?.rows);
  const cabinetCheck = validateCabinet(
    screen?.gabinete,
    "screen[" + index + "].gabinete",
  );

  if (!Number.isInteger(cols))
    errors.push("screen[" + index + "].quantidade_colunas invalido");
  if (!Number.isInteger(rows))
    errors.push("screen[" + index + "].quantidade_linhas invalido");
  if (!cabinetCheck.ok) errors.push(...cabinetCheck.errors);

  return {
    ok: errors.length === 0,
    errors,
    value: {
      id: screen?.id ?? null,
      nome: String(screen?.nome ?? "Tela " + (index + 1)),
      quantidade_colunas: cols,
      quantidade_linhas: rows,
      gabinete: cabinetCheck.value,
    },
  };
}

export function validateConfig(config) {
  const tensao = toPositiveNumber(config?.tensao ?? DEFAULTS.CONFIG.tensao);
  const fase = toPhase(config?.fase ?? DEFAULTS.CONFIG.fase);
  const brilho = toRangeNumber(
    config?.brilho ?? DEFAULTS.CONFIG.brilho,
    0,
    100,
  );
  const margem = toNonNegativeNumber(config?.margem ?? DEFAULTS.CONFIG.margem);
  const reservaCircuito = toNonNegativeNumber(
    config?.reservaCircuito ?? DEFAULTS.CONFIG.reservaCircuito,
  );

  const errors = [];
  if (!Number.isFinite(tensao)) errors.push("config.tensao invalido");
  if (!(fase === 1 || fase === 3)) errors.push("config.fase invalido");
  if (!Number.isFinite(brilho)) errors.push("config.brilho invalido");
  if (!Number.isFinite(margem)) errors.push("config.margem invalido");
  if (!Number.isFinite(reservaCircuito))
    errors.push("config.reservaCircuito invalido");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tensao,
      fase,
      brilho,
      margem,
      reservaCircuito,
    },
  };
}

export function validateProjectInput(input) {
  const configCheck = validateConfig(input?.config ?? {});
  const screensRaw = Array.isArray(input?.screens) ? input.screens : [];

  const screenChecks = screensRaw.map((screen, index) =>
    validateScreen(screen, index),
  );
  const screenErrors = screenChecks.flatMap((item) => item.errors);

  return {
    ok: configCheck.ok && screenChecks.every((item) => item.ok),
    errors: [...configCheck.errors, ...screenErrors],
    value: {
      config: configCheck.value,
      screens: screenChecks.map((item) => item.value),
    },
  };
}

function toNonNegativeNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
}

function toRangeNumber(value, min, max) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : NaN;
}

function toPhase(value) {
  const parsed = Number.parseInt(value, 10);
  return parsed === 3 ? 3 : 1;
}
