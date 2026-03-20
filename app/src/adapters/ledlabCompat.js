import { DEFAULTS } from "../core/constants.js";
import { normalizeProjectV1 } from "../core/project-schema.js";

/**
 * Adaptador opcional para leitura da estrutura de projeto da led-lab_calc.
 * Nao importa formulas antigas: apenas converte dados para o schema project.v1.
 */
export function importLedLabProjectToV1(ledLabProject) {
  if (!ledLabProject || typeof ledLabProject !== "object") {
    throw new TypeError("Projeto led-lab_calc invalido.");
  }

  const screens = Array.isArray(ledLabProject.screens)
    ? ledLabProject.screens
    : [];

  const candidate = {
    version: "project.v1",
    meta: {
      name: String(ledLabProject.name || "Projeto Migrado led-lab_calc"),
      createdAt: ledLabProject.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "led-lab_calc.compat",
      legacyId: ledLabProject.id ?? null,
      legacyActiveScreenIndex: Number.isInteger(ledLabProject.activeScreenIndex)
        ? ledLabProject.activeScreenIndex
        : 0,
    },
    config: {
      tensao: DEFAULTS.CONFIG.tensao,
      fase: DEFAULTS.CONFIG.fase,
      margem: DEFAULTS.CONFIG.margem,
      reservaCircuito: DEFAULTS.CONFIG.reservaCircuito,
    },
    screens: screens.map((screen, index) => mapLedLabScreen(screen, index)),
  };

  return normalizeProjectV1(candidate);
}

function mapLedLabScreen(screen, index) {
  const pxW = toPositiveInt(screen?.pixelX, DEFAULTS.CABINET.px_w);
  const pxH = toPositiveInt(screen?.pixelY, DEFAULTS.CABINET.px_h);
  const cols = toPositiveInt(screen?.cabinetX, 1);
  const rows = toPositiveInt(screen?.cabinetY, 1);
  const peso = toPositiveNumber(screen?.peso, DEFAULTS.CABINET.peso_kg);
  const watts = toPositiveNumber(screen?.consumo, DEFAULTS.CABINET.watts_max);

  return {
    id: screen?.id ?? "ledlab-screen-" + (index + 1),
    nome: String(screen?.name || "Tela " + (index + 1)),
    quantidade_colunas: cols,
    quantidade_linhas: rows,
    gabinete: {
      nome: String(screen?.gabineteNome || DEFAULTS.CABINET.nome),
      largura_mm: DEFAULTS.CABINET.largura_mm,
      altura_mm: DEFAULTS.CABINET.altura_mm,
      px_w: pxW,
      px_h: pxH,
      peso_kg: peso,
      watts_max: watts,
      fp: DEFAULTS.POWER_FACTOR,
    },
  };
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toPositiveNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
