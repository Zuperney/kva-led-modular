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
    window.print();
  });
}
