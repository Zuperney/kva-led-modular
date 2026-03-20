import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCatalogText } from "../src/adapters/importCatalog.js";
import {
  exportProjectJson,
  importProjectJson,
} from "../src/adapters/projectIO.js";
import { createProjectV1 } from "../src/core/project-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

const catalogSample = [
  "nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp",
  "MG10 P2.6;500;500;192;192;6.3;450;0.9",
  "Painel Outdoor X;500;1000;192;384;12.6;900;",
  "Linha invalida",
].join("\n");

const catalogResult = parseCatalogText(catalogSample);

const project = createProjectV1({
  meta: { name: "Projeto IO", source: "phase4.validation" },
  config: { tensao: 380, fase: 3, margem: 15, reservaCircuito: 25 },
  screens: [
    {
      id: "io-1",
      nome: "Tela IO",
      quantidade_colunas: 12,
      quantidade_linhas: 8,
      gabinete: catalogResult.cabinets[0],
    },
  ],
});

const exported = exportProjectJson(project);
const imported = importProjectJson(exported);

const roundtripOk =
  imported.version === project.version &&
  imported.config.tensao === project.config.tensao &&
  imported.screens.length === project.screens.length &&
  imported.screens[0].gabinete.nome === project.screens[0].gabinete.nome;

const report = {
  generatedAt: new Date().toISOString(),
  parser: {
    parsedCount: catalogResult.parsedCount,
    skippedCount: catalogResult.skipped.length,
    fallbackFpApplied: catalogResult.cabinets[1]?.fp === 0.9,
  },
  projectIO: {
    roundtripOk,
    exportedLength: exported.length,
  },
};

const reportPath = path.join(root, "docs", "equivalencia-fase4.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

if (
  report.parser.parsedCount < 2 ||
  !report.parser.fallbackFpApplied ||
  !report.projectIO.roundtripOk
) {
  console.error("Validacao Fase 4: FALHOU", report);
  process.exit(1);
}

console.log("Validacao Fase 4: OK", report);
