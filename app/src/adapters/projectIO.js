import { normalizeProjectV1, isProjectV1 } from "../core/project-schema.js";
import { DEFAULTS } from "../core/constants.js";

export function exportProjectJson(project) {
  const normalized = normalizeProjectV1(project);
  return JSON.stringify(normalized, null, 2);
}

export function importProjectJson(jsonText, options = {}) {
  if (typeof jsonText !== "string") {
    throw new TypeError("Arquivo de projeto deve ser texto JSON.");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON invalido: falha de parse.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Projeto invalido: estrutura raiz ausente.");
  }

  if (isTemplateScreensV1(parsed)) {
    parsed = convertTemplateScreensToProjectV1(parsed, options.catalog || []);
  }

  const normalized = normalizeProjectV1(parsed);

  if (!isProjectV1(normalized)) {
    throw new Error("Projeto invalido: schema nao corresponde a project.v1.");
  }

  return normalized;
}

function isTemplateScreensV1(value) {
  return value?.version === "template.telas.v1";
}

function convertTemplateScreensToProjectV1(template, catalog) {
  const list = Array.isArray(template?.telas) ? template.telas : [];
  if (!list.length) {
    throw new Error("Template de telas invalido: lista de telas vazia.");
  }

  const cabinetsByName = new Map(
    (Array.isArray(catalog) ? catalog : []).map((cab) => [
      String(cab?.nome || ""),
      cab,
    ]),
  );

  const screens = list.map((screen, index) => {
    const cabinetName = String(screen?.gabinete_nome || DEFAULTS.CABINET.nome);
    const matched = cabinetsByName.get(cabinetName);
    const cabinet = matched
      ? toScreenCabinet(matched)
      : {
          ...DEFAULTS.CABINET,
          nome: cabinetName,
        };

    return {
      id: screen?.id || "template-screen-" + (index + 1),
      nome: String(screen?.nome || "Tela " + (index + 1)),
      quantidade_colunas: screen?.quantidade_colunas,
      quantidade_linhas: screen?.quantidade_linhas,
      gabinete: cabinet,
    };
  });

  return {
    version: "project.v1",
    meta: {
      name: String(template?.descricao || "Projeto importado de template"),
      source: "template.telas.v1",
    },
    config: {
      tensao: template?.config?.tensao,
      fase: template?.config?.fase,
      brilho: template?.config?.brilho,
      margem: template?.config?.margem,
      reservaCircuito: template?.config?.reservaCircuito,
    },
    screens,
  };
}

function toScreenCabinet(cab) {
  return {
    nome: cab?.nome,
    largura_mm: cab?.largura_mm,
    altura_mm: cab?.altura_mm,
    px_w: cab?.px_w,
    px_h: cab?.px_h,
    peso_kg: cab?.peso_kg,
    watts_max: cab?.watts_max,
    fp: cab?.fp,
  };
}

export function validateProjectJson(jsonText) {
  try {
    const project = importProjectJson(jsonText);
    return {
      ok: true,
      project,
      errors: [],
    };
  } catch (error) {
    return {
      ok: false,
      project: null,
      errors: [error?.message || "Erro de validacao desconhecido."],
    };
  }
}
