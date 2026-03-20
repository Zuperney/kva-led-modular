import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  migrateLegacyProjectData,
  isProjectV1,
} from "../src/core/project-schema.js";
import { computeProject } from "../src/core/calculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

const legacySample = {
  config: { tensao: 380, fase: 3, margem: 15, reservaCircuito: 25 },
  telas: [
    { id: 1, nome: "Legacy 1", cols: 12, rows: 8 },
    { id: 2, nome: "Legacy 2", cols: 20, rows: 10 },
  ],
};

const migrated = migrateLegacyProjectData(legacySample);
const checkSchema = isProjectV1(migrated);

let calcOk = false;
let calcError = null;

try {
  const result = computeProject({
    config: migrated.config,
    screens: migrated.screens,
  });
  calcOk = result.totals.gabinetes > 0;
} catch (error) {
  calcError = error?.message || "erro desconhecido";
}

const report = {
  generatedAt: new Date().toISOString(),
  checkSchema,
  screensMigrated: migrated.screens.length,
  calcOk,
  calcError,
  metaSource: migrated.meta.source,
};

const reportPath = path.join(root, "docs", "equivalencia-fase3.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

if (!checkSchema || !calcOk) {
  console.error("Validacao Fase 3: FALHOU", report);
  process.exit(1);
}

console.log("Validacao Fase 3: OK", report);
