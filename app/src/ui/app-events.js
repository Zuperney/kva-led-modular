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

function openReportPdfFallback(refs, options = {}) {
  const { mobileCompat = false } = options;
  const source = refs.reportPreview;
  if (!source) return false;

  const cssHref = new URL("./src/styles/main.css", window.location.href).href;

  const clone = source.cloneNode(true);
  const sourceCanvasById = new Map();
  source.querySelectorAll("canvas[data-report-screen-id]").forEach((node) => {
    if (!(node instanceof HTMLCanvasElement)) return;
    const id = String(node.dataset.reportScreenId || "");
    if (!id || sourceCanvasById.has(id)) return;
    sourceCanvasById.set(id, node);
  });

  const sourceSnapshotById = new Map();
  source.querySelectorAll("img[data-print-snapshot-for]").forEach((node) => {
    if (!(node instanceof HTMLImageElement)) return;
    const id = String(node.dataset.printSnapshotFor || "");
    if (!id || sourceSnapshotById.has(id)) return;
    sourceSnapshotById.set(id, node);
  });

  clone.querySelectorAll("canvas[data-report-screen-id]").forEach((node) => {
    if (!(node instanceof HTMLCanvasElement)) return;
    const screenId = String(node.dataset.reportScreenId || "");

    const snapshotImage = sourceSnapshotById.get(screenId);
    let dataUrl =
      snapshotImage instanceof HTMLImageElement
        ? String(snapshotImage.src || "")
        : "";

    if (!dataUrl) {
      const sourceCanvas = sourceCanvasById.get(screenId);
      if (sourceCanvas instanceof HTMLCanvasElement) {
        try {
          dataUrl = sourceCanvas.toDataURL("image/png");
        } catch {
          dataUrl = "";
        }
      }
    }

    if (!dataUrl) return;

    const image = document.createElement("img");
    image.src = dataUrl;
    image.className = node.className + " report-detail-canvas-print";
    image.alt = "Mapa de cabeamento da tela";
    image.dataset.reportScreenId = screenId;
    node.replaceWith(image);
  });

  const exportScript = mobileCompat
    ? '(function(){function waitForImages(){var imgs=Array.from(document.images||[]);if(!imgs.length){return Promise.resolve();}return Promise.all(imgs.map(function(img){if(img.complete){return Promise.resolve();}return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});}));}function createBar(){var bar=document.createElement("div");bar.style.position="sticky";bar.style.top="0";bar.style.zIndex="9999";bar.style.display="flex";bar.style.gap="8px";bar.style.padding="10px";bar.style.background="#ffffff";bar.style.borderBottom="1px solid #d6d6d6";bar.style.margin="-16px -16px 12px";var btn=document.createElement("button");btn.type="button";btn.textContent="Imprimir / Salvar PDF";btn.style.padding="10px 14px";btn.style.borderRadius="10px";btn.style.border="1px solid #0f766e";btn.style.background="#0f766e";btn.style.color="#fff";btn.style.fontWeight="600";btn.addEventListener("click",function(){window.print();});var note=document.createElement("span");note.textContent="Modo compatibilidade mobile ativo";note.style.alignSelf="center";note.style.fontSize="13px";note.style.color="#334155";bar.appendChild(btn);bar.appendChild(note);document.body.insertBefore(bar,document.body.firstChild);}window.onload=function(){waitForImages().then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){createBar();});});});};})();'
    : '(function(){function waitForImages(){var imgs=Array.from(document.images||[]);if(!imgs.length){return Promise.resolve();}return Promise.all(imgs.map(function(img){if(img.complete){return Promise.resolve();}return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});}));}window.onload=function(){waitForImages().then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){window.print();});});});};})();';

  const html =
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Relatorio LedLab CORE</title><link rel="stylesheet" href="' +
    cssHref +
    '"><style>body{margin:0;padding:16px;background:#fff} .report-sheet{border:none;padding:0} .report-page{box-shadow:none} .report-preview-head{display:none}</style></head><body>' +
    clone.innerHTML +
    '<script>' +
    exportScript +
    '<\/script></body></html>';

  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=900",
  );
  if (win) {
    win.document.write(html);
    win.document.close();
    return true;
  }

  if (mobileCompat) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  }

  return false;
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
    const useMobileCompat = shouldUseMobilePdfFallback();
    if (typeof window.print !== "function" || useMobileCompat) {
      const opened = openReportPdfFallback(refs, {
        mobileCompat: useMobileCompat,
      });
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent = opened
          ? useMobileCompat
            ? "Modo de compatibilidade mobile ativo: abra a visualizacao e toque em 'Imprimir / Salvar PDF'."
            : "Relatorio aberto em janela auxiliar para exportacao PDF no mobile/PWA."
          : "Nao foi possivel abrir janela de exportacao PDF. Verifique bloqueio de pop-up.";
      }
      return;
    }
    window.print();
  });
}
