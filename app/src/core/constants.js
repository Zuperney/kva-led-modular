export const APP_META = {
  name: "LedLab CORE",
  version: "0.2.0-phase2",
};

export const SCHEMA_VERSION = "project.v1";

export const STORAGE_KEYS = {
  ACTIVE: "kva-led-modular-v1",
  LEGACY: "kva-led-project-v2",
};

export const TECH_LIMITS = {
  PIXELS_PER_PORT: 655360,
};

export const BREAKERS = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400,
];

export const DEFAULTS = {
  POWER_FACTOR: 0.9,
  CONFIG: {
    tensao: 220,
    fase: 1,
    brilho: 100,
    margem: 15,
    reservaCircuito: 25,
  },
  CABINET: {
    nome: "MG10 P2.6",
    largura_mm: 500,
    altura_mm: 500,
    px_w: 192,
    px_h: 192,
    peso_kg: 6.3,
    watts_max: 450,
    fp: 0.9,
  },
};

export const PROCESSOR_CATALOG = [
  { nome: "MCTRL660", limite_pixels: 2_600_000 },
  { nome: "VX1000", limite_pixels: 6_500_000 },
  { nome: "VX2000 Pro", limite_pixels: 13_000_000 },
  {
    nome: "Serie H (H9 5 cards x 16 portas)",
    limite_pixels: 5 * 16 * TECH_LIMITS.PIXELS_PER_PORT,
  },
];

export const ROUNDING_POLICY = {
  interface: "floor",
  pdf: "raw",
};
