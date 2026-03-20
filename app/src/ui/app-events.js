import { computeProject } from "../core/calculations.js";
import { parseCatalogInput } from "../adapters/importCatalog.js";
import { exportProjectJson, importProjectJson } from "../adapters/projectIO.js";
import { bindCablingEvents } from "./cabling/controller.js";
import { bindCabinetEvents } from "./cabinets/controller.js";
import {
  clearCabinetForm,
  collectCabinetsFromScreens,
  mergeCatalog,
  normalizeScreensWithCatalog,
  persistCabinets,
  readCabinetForm,
  toScreenCabinet,
} from "./cabinets/model.js";
import { createDefaultScreen } from "./defaults.js";
import { bindElectricalEvents } from "./electrical/controller.js";
import { persistElectricalSystemPreference } from "./electrical/preferences.js";
import { bindProjectEvents } from "./project/controller.js";
import { bindScreenEvents } from "./screens/controller.js";
import { readFileText } from "./shared/file.js";
import { escapeHtml } from "./shared/format.js";
import {
  clampNonNegativeNumber,
  clampPositiveInt,
  clampRangeNumber,
} from "./shared/validation.js";
import { bindTestCardEvents } from "./testcard/controller.js";
import { exportTestCard } from "./testcard/export.js";

function shouldUseMobilePdfFallback() {
  const ua = navigator.userAgent || "";
  const isMobileUa = /Android|iPhone|iPad|iPod/i.test(ua);
  const isStandalone =
    Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches) ||
    window.navigator.standalone === true;
  return isMobileUa || isStandalone;
}

function openReportPdfFallback(refs) {
  const source = refs.reportPreview;
  if (!source) return false;

  const clone = source.cloneNode(true);
  const sourceCanvases = source.querySelectorAll(
    "canvas[data-report-screen-id]",
  );
  const cloneCanvases = clone.querySelectorAll("canvas[data-report-screen-id]");

  sourceCanvases.forEach((sourceCanvas, index) => {
    const cloneCanvas = cloneCanvases[index];
    if (!(cloneCanvas instanceof HTMLCanvasElement)) return;
    if (!(sourceCanvas instanceof HTMLCanvasElement)) return;

    let dataUrl = "";
    try {
      dataUrl = sourceCanvas.toDataURL("image/png");
    } catch {
      dataUrl = "";
    }

    if (!dataUrl) return;

    const image = document.createElement("img");
    image.src = dataUrl;
    image.className = sourceCanvas.className + " report-detail-canvas-print";
    image.alt = "Mapa de cabeamento da tela";
    cloneCanvas.replaceWith(image);
  });

  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=900",
  );
  if (!win) return false;

  win.document.write(
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Relatorio LedLab CORE</title><link rel="stylesheet" href="./src/styles/main.css"><style>body{margin:0;padding:16px;background:#fff} .report-sheet{border:none;padding:0} .report-page{box-shadow:none} .report-preview-head{display:none}</style></head><body>' +
      clone.innerHTML +
      "<script>window.onload=function(){window.print();};<\/script></body></html>",
  );
  win.document.close();
  return true;
}

export function bindEvents(refs, getState, getUi, setState, setUi) {
  refs.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      setUi({ activeView: view || "project" });
    });
  });

  bindScreenEvents({
    refs,
    getState,
    getUi,
    setState,
    setUi,
    createDefaultScreen,
    clampPositiveInt,
    toScreenCabinet,
  });

  bindCablingEvents({ refs, getUi, setUi });

  bindTestCardEvents({
    refs,
    getState,
    getUi,
    setUi,
    computeProject,
    exportTestCard: (innerRefs, uiState, screens, mode) =>
      exportTestCard(innerRefs, uiState, screens, mode, escapeHtml),
  });

  refs.cfgOverclock?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const current = getState();
    setState({
      ...current,
      config: { ...current.config, overclock: target.checked },
    });
  });

  bindElectricalEvents({
    refs,
    getState,
    getUi,
    setState,
    setUi,
    persistElectricalSystemPreference,
    clampRangeNumber,
    clampNonNegativeNumber,
    clampPositiveInt,
  });

  bindProjectEvents({
    refs,
    getState,
    getUi,
    setState,
    exportProjectJson,
    importProjectJson,
    readFileText,
    mergeCatalog,
    collectCabinetsFromScreens,
    persistCabinets,
    normalizeScreensWithCatalog,
  });

  bindCabinetEvents({
    refs,
    getState,
    getUi,
    setState,
    setUi,
    parseCatalogInput,
    readFileText,
    mergeCatalog,
    persistCabinets,
    normalizeScreensWithCatalog,
    readCabinetForm,
    clearCabinetForm,
  });

  refs.btnPrintReport?.addEventListener("click", () => {
    document.body.classList.remove("print-compact");
    if (shouldUseMobilePdfFallback() && refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Em mobile/PWA, use Exportar PDF para um caminho mais confiavel de geracao.";
    }
    window.print();
  });

  refs.btnPrintCompact?.addEventListener("click", () => {
    document.body.classList.add("print-compact");
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("print-compact");
    }, 1000);
  });

  refs.reportType?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    setUi({ reportType: target.value });
  });

  refs.btnExportDetailedReportPdf?.addEventListener("click", () => {
    document.body.classList.remove("print-compact");
    if (typeof window.print !== "function" || shouldUseMobilePdfFallback()) {
      const opened = openReportPdfFallback(refs);
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent = opened
          ? "Relatorio aberto em janela auxiliar para exportacao PDF no mobile/PWA."
          : "Nao foi possivel abrir janela de exportacao PDF. Verifique bloqueio de pop-up.";
      }
      return;
    }
    window.print();
  });
}
