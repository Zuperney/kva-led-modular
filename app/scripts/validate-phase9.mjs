import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCatalogInput } from "../src/adapters/importCatalog.js";
import {
  importProjectJson,
  exportProjectJson,
  validateProjectJson,
} from "../src/adapters/projectIO.js";
import { computeProject } from "../src/core/calculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

const templateCatalogPath = path.join(
  root,
  "templates",
  "template.gabinetes.v1.json",
);
const templateScreensPath = path.join(
  root,
  "templates",
  "template.telas.v1.json",
);
const reportPath = path.join(root, "docs", "equivalencia-fase9.json");

function almostEqual(a, b, epsilon = 0.000001) {
  return Math.abs(Number(a) - Number(b)) <= epsilon;
}

function run() {
  const checks = [];

  const catalogText = fs.readFileSync(templateCatalogPath, "utf-8");
  const catalogParsed = parseCatalogInput(catalogText);
  checks.push({
    name: "catalog_import_has_items",
    ok: catalogParsed.parsedCount > 0,
    detail: {
      parsedCount: catalogParsed.parsedCount,
      skipped: catalogParsed.skipped.length,
    },
  });

  const screensText = fs.readFileSync(templateScreensPath, "utf-8");
  const importedProject = importProjectJson(screensText, {
    catalog: catalogParsed.cabinets,
  });

  checks.push({
    name: "template_telas_imported",
    ok:
      Array.isArray(importedProject.screens) &&
      importedProject.screens.length > 0,
    detail: { screens: importedProject.screens.length },
  });

  checks.push({
    name: "template_brightness_present",
    ok: Number.isFinite(importedProject.config?.brilho),
    detail: { brilho: importedProject.config?.brilho },
  });

  const computed = computeProject({
    config: importedProject.config,
    screens: importedProject.screens,
  });

  checks.push({
    name: "compute_project_totals_finite",
    ok:
      Number.isFinite(computed.totals.potencia_w) &&
      Number.isFinite(computed.totals.carga_kva) &&
      Number.isFinite(computed.totals.corrente_a),
    detail: {
      potencia_w: computed.totals.potencia_w,
      carga_kva: computed.totals.carga_kva,
      corrente_a: computed.totals.corrente_a,
    },
  });

  const exported = exportProjectJson(importedProject);
  const roundtripValidation = validateProjectJson(exported);
  checks.push({
    name: "io_roundtrip_v1_ok",
    ok: roundtripValidation.ok,
    detail: { errors: roundtripValidation.errors },
  });

  const project100 = {
    config: { ...importedProject.config, brilho: 100 },
    screens: importedProject.screens,
  };
  const project50 = {
    config: { ...importedProject.config, brilho: 50 },
    screens: importedProject.screens,
  };
  const power100 = computeProject(project100).totals.potencia_w;
  const power50 = computeProject(project50).totals.potencia_w;

  checks.push({
    name: "brightness_50_reduces_power_linearly",
    ok: almostEqual(power50, power100 * 0.5),
    detail: { power100, power50 },
  });

  const altCabinet = catalogParsed.cabinets.find(
    (cab) => cab.nome !== importedProject.screens[0]?.gabinete?.nome,
  );
  let cabinetSwapOk = false;
  let cabinetSwapDetail = { skipped: true };

  if (altCabinet) {
    const baseScreen = importedProject.screens[0];
    const baseConfig = importedProject.config;

    const before = computeProject({
      config: baseConfig,
      screens: [baseScreen],
    }).totals.potencia_w;

    const after = computeProject({
      config: baseConfig,
      screens: [
        {
          ...baseScreen,
          gabinete: {
            nome: altCabinet.nome,
            largura_mm: altCabinet.largura_mm,
            altura_mm: altCabinet.altura_mm,
            px_w: altCabinet.px_w,
            px_h: altCabinet.px_h,
            peso_kg: altCabinet.peso_kg,
            watts_max: altCabinet.watts_max,
            fp: altCabinet.fp,
          },
        },
      ],
    }).totals.potencia_w;

    cabinetSwapOk = !almostEqual(before, after);
    cabinetSwapDetail = {
      before,
      after,
      baseCabinet: baseScreen.gabinete.nome,
      altCabinet: altCabinet.nome,
    };
  }

  checks.push({
    name: "cabinet_change_impacts_calculation",
    ok: cabinetSwapOk,
    detail: cabinetSwapDetail,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    suite: "phase9-operational",
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.ok).length,
      failed: checks.filter((check) => !check.ok).length,
    },
    checks,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  if (report.summary.failed > 0) {
    console.error("Validacao Fase 9: FALHOU", {
      failed: report.summary.failed,
      reportPath,
    });
    process.exit(1);
  }

  console.log("Validacao Fase 9: OK", {
    totalChecks: report.summary.total,
    totalPassed: report.summary.passed,
    reportPath,
  });
}

run();
