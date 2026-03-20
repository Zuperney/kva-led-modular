import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { computeProject } from "../src/core/calculations.js";
import {
  recommendProcessor,
  estimateRequiredPorts,
} from "../src/core/recommendations.js";
import { validateProjectInput } from "../src/core/validators.js";
import { createProjectV1 } from "../src/core/project-schema.js";
import {
  exportProjectJson,
  importProjectJson,
  validateProjectJson,
} from "../src/adapters/projectIO.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const casesPath = path.join(root, "docs", "casos-validacao.json");

function runRegressionScenarios() {
  const raw = fs.readFileSync(casesPath, "utf-8");
  const dataset = JSON.parse(raw);
  const scenarios = Array.isArray(dataset.scenarios) ? dataset.scenarios : [];

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

      const numericChecks = [
        [
          "gabinetes_totais",
          screen.gabinetes_totais,
          expected.gabinetes_totais,
        ],
        ["potencia_w", totals.potencia_w, expected.potencia_w],
        ["carga_kva", totals.carga_kva, expected.carga_kva],
        ["corrente_a", totals.corrente_a, expected.corrente_a],
        [
          "disjuntor_minimo_a",
          totals.disjuntor_minimo_a,
          expected.disjuntor_minimo_a,
        ],
        ["peso_kg", totals.peso_kg, expected.peso_kg],
      ];

      for (const [field, actual, exp] of numericChecks) {
        const diff = Math.abs(Number(actual) - Number(exp));
        if (diff > tolerance[field]) {
          ok = false;
          issues.push({ field, expected: exp, actual, diff });
        }
      }

      const pixelChecks = ["largura", "altura", "totais"];
      for (const pxField of pixelChecks) {
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

      results.push({ id: scenario.id, name: scenario.name, ok, issues });
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

  return {
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}

function runUnitTests() {
  const checks = [];

  checks.push({
    name: "ports_zero",
    ok: estimateRequiredPorts(0) === 0,
  });
  checks.push({
    name: "ports_boundary_exact",
    ok: estimateRequiredPorts(655360) === 1,
  });
  checks.push({
    name: "ports_boundary_over",
    ok: estimateRequiredPorts(655361) === 2,
  });

  checks.push({
    name: "processor_mctrl660",
    ok: recommendProcessor(2600000).label === "MCTRL660",
  });
  checks.push({
    name: "processor_vx1000",
    ok: recommendProcessor(2600001).label === "VX1000",
  });
  checks.push({
    name: "processor_multi_h9",
    ok: recommendProcessor(60000000).label.startsWith("2x Serie H"),
  });

  const invalidInput = {
    config: { tensao: -10, fase: 2, margem: -1, reservaCircuito: -5 },
    screens: [],
  };
  checks.push({
    name: "validator_rejects_invalid_input",
    ok: validateProjectInput(invalidInput).ok === false,
  });

  const baseOutput = computeProject({
    config: { tensao: 220, fase: 1, margem: 15, reservaCircuito: 25 },
    screens: [
      {
        id: "u1",
        nome: "Tela Unit",
        quantidade_colunas: 4,
        quantidade_linhas: 3,
        gabinete: {
          nome: "MG10 P2.6",
          largura_mm: 500,
          altura_mm: 500,
          px_w: 192,
          px_h: 192,
          peso_kg: 6.3,
          watts_max: 450,
          fp: 0.9,
        },
      },
    ],
  });

  checks.push({
    name: "compute_project_has_totals",
    ok:
      Number.isFinite(baseOutput.totals.potencia_w) &&
      Number.isFinite(baseOutput.totals.carga_kva) &&
      Number.isFinite(baseOutput.totals.corrente_a),
  });

  return {
    total: checks.length,
    passed: checks.filter((c) => c.ok).length,
    failed: checks.filter((c) => !c.ok).length,
    checks,
  };
}

function runImportExportTests() {
  const project = createProjectV1({
    meta: { name: "Teste IO" },
    config: { tensao: 380, fase: 3, margem: 15, reservaCircuito: 25 },
    screens: [
      {
        id: "io-1",
        nome: "Tela IO 1",
        quantidade_colunas: 8,
        quantidade_linhas: 4,
      },
      {
        id: "io-2",
        nome: "Tela IO 2",
        quantidade_colunas: 10,
        quantidade_linhas: 6,
      },
    ],
  });

  const json = exportProjectJson(project);
  const imported = importProjectJson(json);

  assert.equal(imported.version, "project.v1");
  assert.equal(imported.screens.length, 2);
  assert.equal(imported.config.tensao, 380);
  assert.equal(imported.config.fase, 3);

  const validationOk = validateProjectJson(json);
  const validationBad = validateProjectJson("{not-json}");

  return {
    total: 3,
    passed: (validationOk.ok ? 1 : 0) + (!validationBad.ok ? 1 : 0) + 1,
    failed: (validationOk.ok ? 0 : 1) + (!validationBad.ok ? 0 : 1),
    checks: [
      { name: "io_roundtrip_schema_v1", ok: true },
      { name: "io_validate_ok", ok: validationOk.ok },
      { name: "io_validate_bad_json", ok: !validationBad.ok },
    ],
  };
}

const regression = runRegressionScenarios();
const unit = runUnitTests();
const io = runImportExportTests();

const report = {
  generatedAt: new Date().toISOString(),
  suite: "phase7-minimal",
  regression,
  unit,
  io,
  summary: {
    totalChecks: regression.total + unit.total + io.total,
    totalPassed: regression.passed + unit.passed + io.passed,
    totalFailed: regression.failed + unit.failed + io.failed,
  },
};

const reportPath = path.join(root, "docs", "equivalencia-fase7.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

if (report.summary.totalFailed > 0) {
  console.error("Validacao Fase 7: FALHOU", {
    totalFailed: report.summary.totalFailed,
    reportPath,
  });
  process.exit(1);
}

console.log("Validacao Fase 7: OK", {
  totalChecks: report.summary.totalChecks,
  totalPassed: report.summary.totalPassed,
  reportPath,
});
