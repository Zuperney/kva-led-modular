import { BREAKERS, ROUNDING_POLICY } from "./constants.js";
import {
  recommendProcessor,
  estimateRequiredPorts,
} from "./recommendations.js";
import { validateProjectInput } from "./validators.js";

export function computeScreen(screen, config) {
  const cols = screen.quantidade_colunas;
  const rows = screen.quantidade_linhas;
  const cab = screen.gabinete;

  const gabinetesTotais = cols * rows;
  const larguraM = (cols * cab.largura_mm) / 1000;
  const alturaM = (rows * cab.altura_mm) / 1000;
  const areaM2 = larguraM * alturaM;

  const pxLargura = cols * cab.px_w;
  const pxAltura = rows * cab.px_h;
  const pixelsTotais = pxLargura * pxAltura;

  const brilhoFator = (config.brilho ?? 100) / 100;
  const potenciaW =
    gabinetesTotais * cab.watts_max * brilhoFator * (1 + config.margem / 100);
  const pesoKg = gabinetesTotais * cab.peso_kg;
  const cargaKva = potenciaW / (cab.fp * 1000);

  const correnteA =
    config.fase === 3
      ? potenciaW / (Math.sqrt(3) * config.tensao * cab.fp)
      : potenciaW / (config.tensao * cab.fp);

  const disjuntorMinimoA = correnteA * (1 + config.reservaCircuito / 100);

  return {
    id: screen.id,
    nome: screen.nome,
    gabinete: cab,
    quantidade_colunas: cols,
    quantidade_linhas: rows,
    gabinetes_totais: gabinetesTotais,
    dimensoes_m: {
      largura: larguraM,
      altura: alturaM,
      area: areaM2,
    },
    pixels: {
      largura: pxLargura,
      altura: pxAltura,
      totais: pixelsTotais,
    },
    potencia_w: potenciaW,
    peso_kg: pesoKg,
    carga_kva: cargaKva,
    corrente_a: correnteA,
    disjuntor_minimo_a: disjuntorMinimoA,
    disjuntor_comercial: pickBreaker(disjuntorMinimoA),
  };
}

export function computeProject(input) {
  const validation = validateProjectInput(input);
  if (!validation.ok) {
    throw new Error("Entrada invalida: " + validation.errors.join(" | "));
  }

  const data = validation.value;
  const screens = data.screens.map((screen) =>
    computeScreen(screen, data.config),
  );

  const totals = screens.reduce(
    (acc, item) => {
      acc.gabinetes += item.gabinetes_totais;
      acc.area_m2 += item.dimensoes_m.area;
      acc.pixels += item.pixels.totais;
      acc.potencia_w += item.potencia_w;
      acc.peso_kg += item.peso_kg;
      acc.carga_kva += item.carga_kva;
      acc.corrente_a += item.corrente_a;
      return acc;
    },
    {
      gabinetes: 0,
      area_m2: 0,
      pixels: 0,
      potencia_w: 0,
      peso_kg: 0,
      carga_kva: 0,
      corrente_a: 0,
    },
  );

  const disjuntorMinimoProjeto =
    totals.corrente_a * (1 + data.config.reservaCircuito / 100);
  const recommendation = recommendProcessor(totals.pixels);

  return {
    config: data.config,
    policy: ROUNDING_POLICY,
    screens,
    totals: {
      ...totals,
      disjuntor_minimo_a: disjuntorMinimoProjeto,
      disjuntor_comercial: pickBreaker(disjuntorMinimoProjeto),
      portas_estimadas: estimateRequiredPorts(totals.pixels),
      processadora: recommendation,
    },
  };
}

export function toUiFloor(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.floor((Number(value) || 0) * factor) / factor;
}

export function buildUiProjection(projectResult) {
  const t = projectResult.totals;
  return {
    gabinetes: toUiFloor(t.gabinetes, 0),
    area_m2: toUiFloor(t.area_m2, 2),
    pixels: toUiFloor(t.pixels, 0),
    potencia_w: toUiFloor(t.potencia_w, 0),
    peso_kg: toUiFloor(t.peso_kg, 1),
    carga_kva: toUiFloor(t.carga_kva, 2),
    corrente_a: toUiFloor(t.corrente_a, 2),
    disjuntor_minimo_a: toUiFloor(t.disjuntor_minimo_a, 2),
    disjuntor_comercial: t.disjuntor_comercial,
    portas_estimadas: t.portas_estimadas,
    processadora_label: t.processadora.label,
  };
}

function pickBreaker(current) {
  const breaker = BREAKERS.find((item) => item >= current);
  return breaker ?? "> " + BREAKERS[BREAKERS.length - 1];
}
