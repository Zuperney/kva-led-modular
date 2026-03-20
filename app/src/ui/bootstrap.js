import {
  canUseLocalStorage,
  loadProject,
  saveProject,
} from "../adapters/storage.js";
import { bindEvents } from "./app-events.js";
import { renderAll } from "./app-render.js";
import {
  loadCabinetCatalog,
  normalizeScreensWithCatalog,
} from "./cabinets/model.js";
import { createDefaultProject } from "./defaults.js";
import { syncElectricalControls } from "./electrical/controller.js";
import { loadElectricalSystemPreference } from "./electrical/preferences.js";
import { setupReportPrintHandlers } from "./report/view.js";
import { createUiRefs } from "./refs.js";
import {
  clampNonNegativeNumber,
  clampPositiveInt,
  clampRangeNumber,
} from "./shared/validation.js";
import { createInitialUiState } from "./state.js";

function refreshIcons() {
  const lucide = globalThis?.lucide;
  if (!lucide || typeof lucide.createIcons !== "function") return;
  lucide.createIcons();
}

export function bootstrapApp() {
  const refs = createUiRefs();
  let warnedStorageFallback = false;

  function notifyStorageFallback() {
    if (warnedStorageFallback) return;
    warnedStorageFallback = true;
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Aviso: armazenamento local indisponivel. O app segue em modo sem persistencia nesta sessao.";
    }
  }

  if (!canUseLocalStorage()) {
    notifyStorageFallback();
  }

  let state = loadProject() || createDefaultProject();
  if (!Array.isArray(state.screens) || state.screens.length === 0) {
    state = createDefaultProject();
  }

  const ui = createInitialUiState(state, {
    loadCabinetCatalog,
    loadElectricalSystemPreference,
  });

  state = normalizeScreensWithCatalog(state, ui.cabinets);
  syncElectricalControls(
    refs,
    state.config,
    ui.electricalSystem,
    clampRangeNumber,
    clampNonNegativeNumber,
    clampPositiveInt,
  );

  bindEvents(
    refs,
    () => state,
    () => ui,
    (nextState) => {
      state = nextState;
      const persisted = saveProject(state);
      if (!persisted) {
        notifyStorageFallback();
      }
      renderAll(refs, state, ui);
      refreshIcons();
    },
    (partialUi) => {
      Object.assign(ui, partialUi);
      renderAll(refs, state, ui);
      refreshIcons();
    },
  );

  renderAll(refs, state, ui);
  refreshIcons();
  setupReportPrintHandlers();
}
