import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeProject } from "../src/core/calculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const casesPath = path.join(root, "docs", "casos-validacao.json");

const raw = fs.readFileSync(casesPath, "utf-8");
const dataset = JSON.parse(raw);
const scenarios = Array.isArray(dataset.scenarios) ? dataset.scenarios : [];

const fieldsToCompare = [
  "gabinetes_totais",
  "potencia_w",
  "carga_kva",
  "corrente_a",
  "disjuntor_minimo_a",
  "peso_kg",
];

const pixelFields = ["largura", "altura", "totais"];

const tolerance = {
  gabinetes_totais: 0,
  potencia_w: 0.000001,
  carga_kva: 0.000001,
  corrente_a: 0.000001,
  disjuntor_minimo_a: 0.000001,
  peso_kg: 0.000001,
};

const results = [];

for (const scenario of scenarios) {
  const input = {
    config: scenario.config,
    screens: [
      {
        id: scenario.id,
        nome: scenario.name,
        quantidade_colunas: scenario.input.quantidade_colunas,
        quantidade_linhas: scenario.input.quantidade_linhas,
        gabinete: scenario.gabinete,
      },
    ],
  };

  let ok = true;
  const issues = [];

  try {
    const output = computeProject(input);
    const screen = output.screens[0];
    const totals = output.totals;
    const expected = scenario.expected;

    for (const field of fieldsToCompare) {
      const actual =
        field === "gabinetes_totais" ? screen.gabinetes_totais : totals[field];
      const exp = expected[field];
      const diff = Math.abs(Number(actual) - Number(exp));
      if (diff > tolerance[field]) {
        ok = false;
        issues.push({ field, expected: exp, actual, diff });
      }
    }

    for (const pxField of pixelFields) {
      const actualPx = screen.pixels[pxField];
      const expectedPx = expected.pixels[pxField];
      if (Number(actualPx) !== Number(expectedPx)) {
        ok = false;
        issues.push({
          field: "pixels." + pxField,
          expected: expectedPx,
          actual: actualPx,
          diff: Math.abs(Number(actualPx) - Number(expectedPx)),
        });
      }
    }

    if (
      String(totals.disjuntor_comercial) !==
      String(expected.disjuntor_comercial)
    ) {
      ok = false;
      issues.push({
        field: "disjuntor_comercial",
        expected: expected.disjuntor_comercial,
        actual: totals.disjuntor_comercial,
      });
    }

    if (
      String(totals.processadora.label) !==
      String(expected.processadora_sugerida)
    ) {
      ok = false;
      issues.push({
        field: "processadora_sugerida",
        expected: expected.processadora_sugerida,
        actual: totals.processadora.label,
      });
    }

    results.push({
      id: scenario.id,
      name: scenario.name,
      ok,
      issues,
    });
  } catch (error) {
    results.push({
      id: scenario.id,
      name: scenario.name,
      ok: false,
      issues: [
        { field: "runtime", message: error?.message || "Erro desconhecido" },
      ],
    });
  }
}

const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;

const report = {
  generatedAt: new Date().toISOString(),
  source: "app/src/core/calculations.js",
  totalScenarios: results.length,
  passed,
  failed,
  results,
};

const reportPath = path.join(root, "docs", "equivalencia-fase2.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

if (failed > 0) {
  console.error("Equivalencia Fase 2: FALHOU", { passed, failed, reportPath });
  process.exit(1);
}

console.log("Equivalencia Fase 2: OK", { passed, failed, reportPath });
