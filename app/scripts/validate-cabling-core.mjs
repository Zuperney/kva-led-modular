import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCablingLayoutFromScreen,
  buildCablingLayouts,
  findBestBlock,
} from "../src/core/cabling.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const reportPath = path.join(root, "docs", "equivalencia-cabeamento-core.json");

function run() {
  const checks = [];

  const baseScreen = {
    id: "screen-core-1",
    nome: "Tela Core",
    quantidade_colunas: 12,
    quantidade_linhas: 8,
    gabinete: {
      px_w: 192,
      px_h: 192,
    },
  };

  const layout = buildCablingLayoutFromScreen(baseScreen);

  checks.push({
    name: "layout_has_blocks",
    ok: Array.isArray(layout.blocks) && layout.blocks.length > 0,
    detail: { blocks: layout.blocks.length },
  });

  checks.push({
    name: "layout_blocks_cover_all_gabinetes",
    ok:
      layout.blocks.reduce((acc, block) => acc + block.w * block.h, 0) ===
      baseScreen.quantidade_colunas * baseScreen.quantidade_linhas,
  });

  checks.push({
    name: "safe_limit_positive",
    ok: Number(layout.maxGabsPerCable) >= 1,
    detail: { maxGabsPerCable: layout.maxGabsPerCable },
  });

  checks.push({
    name: "deterministic_best_block",
    ok:
      JSON.stringify(findBestBlock(12, 8, layout.maxGabsPerCable)) ===
      JSON.stringify(findBestBlock(12, 8, layout.maxGabsPerCable)),
  });

  const layouts = buildCablingLayouts([
    baseScreen,
    { ...baseScreen, id: "screen-core-2" },
  ]);
  checks.push({
    name: "bulk_layout_builder",
    ok: layouts.length === 2 && layouts.every((item) => item.cables >= 1),
  });

  const report = {
    generatedAt: new Date().toISOString(),
    suite: "cabling-core",
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.ok).length,
      failed: checks.filter((check) => !check.ok).length,
    },
    checks,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  if (report.summary.failed > 0) {
    console.error("Validacao Cabeamento Core: FALHOU", {
      failed: report.summary.failed,
      reportPath,
    });
    process.exit(1);
  }

  console.log("Validacao Cabeamento Core: OK", {
    totalChecks: report.summary.total,
    totalPassed: report.summary.passed,
    reportPath,
  });
}

run();
