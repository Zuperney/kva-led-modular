import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importLedLabProjectToV1 } from "../src/adapters/ledlabCompat.js";
import { computeProject } from "../src/core/calculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

const ledLabSample = {
  id: "legacy-xyz",
  name: "Projeto Origem LedLab",
  createdAt: "2026-03-18T00:00:00.000Z",
  activeScreenIndex: 1,
  screens: [
    {
      id: "a",
      name: "Tela A",
      pixelX: 192,
      pixelY: 192,
      cabinetX: 12,
      cabinetY: 8,
      peso: 6.3,
      consumo: 450,
    },
    {
      id: "b",
      name: "Tela B",
      pixelX: 192,
      pixelY: 192,
      cabinetX: 20,
      cabinetY: 10,
      peso: 6.3,
      consumo: 450,
    },
  ],
};

const converted = importLedLabProjectToV1(ledLabSample);
const result = computeProject({
  config: converted.config,
  screens: converted.screens,
});

const report = {
  generatedAt: new Date().toISOString(),
  convertedVersion: converted.version,
  metaSource: converted.meta.source,
  screensConverted: converted.screens.length,
  calculationsOk:
    Number.isFinite(result.totals.potencia_w) && result.totals.potencia_w > 0,
  totalGabinetes: result.totals.gabinetes,
};

const reportPath = path.join(root, "docs", "equivalencia-fase5.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

if (
  report.convertedVersion !== "project.v1" ||
  report.metaSource !== "led-lab_calc.compat" ||
  report.screensConverted !== 2 ||
  !report.calculationsOk
) {
  console.error("Validacao Fase 5: FALHOU", report);
  process.exit(1);
}

console.log("Validacao Fase 5: OK", report);
