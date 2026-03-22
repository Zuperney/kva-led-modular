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
import {
  exportReportPdfMobileNative,
  openReportPdfFallback,
  shouldUseMobilePdfFallback,
} from "./report/pdf-export.js";
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

const VIEW_ORDER = [
  "home",
  "project",
  "cabling",
  "info",
  "report",
  "cabinets",
  "testcard",
];

const VIEW_LABEL = {
  home: "Home",
  project: "Projetos",
  cabling: "Cabeamento",
  info: "Info Tecnica",
  report: "Relatorios",
  cabinets: "Gabinetes",
  testcard: "Test Card",
};

export function bindEvents(refs, getState, getUi, setState, setUi) {
  function setActiveView(nextView) {
    const view = VIEW_ORDER.includes(nextView) ? nextView : "home";
    setUi({ activeView: view });
    updateViewFlow(view);
  }

  function updateViewFlow(activeView) {
    const currentIndex = VIEW_ORDER.indexOf(activeView);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const prevView =
      VIEW_ORDER[(safeIndex - 1 + VIEW_ORDER.length) % VIEW_ORDER.length];
    const nextView = VIEW_ORDER[(safeIndex + 1) % VIEW_ORDER.length];

    if (refs.viewFlowLabel) {
      refs.viewFlowLabel.textContent =
        VIEW_LABEL[activeView] || VIEW_LABEL.home;
    }
    if (refs.btnViewPrev) {
      refs.btnViewPrev.dataset.targetView = prevView;
    }
    if (refs.btnViewNext) {
      refs.btnViewNext.dataset.targetView = nextView;
    }
  }

  refs.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      setActiveView(view || "home");
    });
  });

  refs.btnViewPrev?.addEventListener("click", () => {
    const target = refs.btnViewPrev?.dataset.targetView || "home";
    setActiveView(target);
  });

  refs.btnViewNext?.addEventListener("click", () => {
    const target = refs.btnViewNext?.dataset.targetView || "project";
    setActiveView(target);
  });

  updateViewFlow(getUi()?.activeView || "home");

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

  refs.btnExportDetailedReportPdf?.addEventListener("click", async () => {
    document.body.classList.remove("print-compact");
    const useMobileCompat = shouldUseMobilePdfFallback();
    if (typeof window.print !== "function" || useMobileCompat) {
      if (useMobileCompat) {
        if (refs.migrationStatus) {
          refs.migrationStatus.textContent =
            "Gerando PDF em modo compatibilidade mobile...";
        }
        const generated = await exportReportPdfMobileNative(refs);
        if (generated) {
          if (refs.migrationStatus) {
            refs.migrationStatus.textContent =
              "PDF gerado por biblioteca nativa (mobile).";
          }
          return;
        }
      }

      const opened = openReportPdfFallback(refs, {
        mobileCompat: useMobileCompat,
      });
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent = opened
          ? useMobileCompat
            ? "Biblioteca mobile indisponivel. Modo de compatibilidade ativo: abra a visualizacao e toque em 'Imprimir / Salvar PDF'."
            : "Relatorio aberto em janela auxiliar para exportacao PDF no mobile/PWA."
          : "Nao foi possivel abrir janela de exportacao PDF. Verifique bloqueio de pop-up.";
      }
      return;
    }
    window.print();
  });
}
