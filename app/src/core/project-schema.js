import { DEFAULTS, SCHEMA_VERSION } from "./constants.js";
import { toPositiveInt, toPositiveNumber } from "./parsers.js";
import { validateProjectInput } from "./validators.js";

export function createProjectV1(input = {}) {
  const now = new Date().toISOString();
  const config = normalizeConfig(input.config);
  const screens = normalizeScreens(input.screens);

  return {
    version: SCHEMA_VERSION,
    meta: {
      name: String(input?.meta?.name || "Projeto Modular"),
      createdAt: input?.meta?.createdAt || now,
      updatedAt: now,
      source: input?.meta?.source || "app.modular",
    },
    config,
    screens,
  };
}

export function isProjectV1(value) {
  return (
    !!value &&
    value.version === SCHEMA_VERSION &&
    Array.isArray(value.screens) &&
    !!value.config
  );
}

export function normalizeProjectV1(value) {
  const project = createProjectV1(value);
  const check = validateProjectInput({
    config: project.config,
    screens: project.screens,
  });

  if (!check.ok) {
    throw new Error("Projeto v1 invalido: " + check.errors.join(" | "));
  }

  return {
    ...project,
    config: check.value.config,
    screens: check.value.screens,
  };
}

export function migrateLegacyProjectData(legacyData) {
  const telas = Array.isArray(legacyData?.telas) ? legacyData.telas : [];
  const legacyConfig = legacyData?.config || {};

  const config = normalizeConfig({
    tensao: legacyConfig.tensao,
    fase: legacyConfig.fase,
    margem: legacyConfig.margem,
    reservaCircuito: legacyConfig.reservaCircuito,
  });

  const screens = telas.map((tela, index) => ({
    id: tela?.id ?? "legacy-" + (index + 1),
    nome: String(tela?.nome || "Tela " + (index + 1)),
    quantidade_colunas: toPositiveInt(tela?.cols, 1),
    quantidade_linhas: toPositiveInt(tela?.rows, 1),
    gabinete: { ...DEFAULTS.CABINET },
  }));

  return normalizeProjectV1({
    meta: {
      name: "Projeto Migrado (Legacy)",
      source: "legacy.kva-led-project-v2",
    },
    config,
    screens,
  });
}

function normalizeConfig(config = {}) {
  return {
    tensao: toPositiveNumber(config.tensao, DEFAULTS.CONFIG.tensao),
    fase: toPhase(config.fase, DEFAULTS.CONFIG.fase),
    brilho: toRangeNumber(config.brilho, DEFAULTS.CONFIG.brilho, 0, 100),
    margem: toNonNegativeNumber(config.margem, DEFAULTS.CONFIG.margem),
    reservaCircuito: toNonNegativeNumber(
      config.reservaCircuito,
      DEFAULTS.CONFIG.reservaCircuito,
    ),
  };
}

function normalizeScreens(screens) {
  const list = Array.isArray(screens) ? screens : [];
  return list.map((screen, index) => ({
    id: screen?.id ?? "screen-" + (index + 1),
    nome: String(screen?.nome || "Tela " + (index + 1)),
    quantidade_colunas: toPositiveInt(
      screen?.quantidade_colunas ?? screen?.cols,
      1,
    ),
    quantidade_linhas: toPositiveInt(
      screen?.quantidade_linhas ?? screen?.rows,
      1,
    ),
    gabinete: {
      ...DEFAULTS.CABINET,
      ...(screen?.gabinete || {}),
    },
  }));
}

function toNonNegativeNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function toRangeNumber(value, fallback, min, max) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
}

function toPhase(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (parsed === 1 || parsed === 3) return parsed;
  return fallback;
}
