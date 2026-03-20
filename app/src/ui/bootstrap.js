import { loadProject, saveProject } from "../adapters/storage.js";
import { bindEvents } from "./app-events.js";
import { renderAll } from "./app-render.js";
import {
  loadCabinetCatalog,
  normalizeScreensWithCatalog,
} from "./cabinets/model.js";
import { createDefaultProject } from "./defaults.js";
import { syncElectricalControls } from "./electrical/controller.js";
import { loadElectricalSystemPreference } from "./electrical/preferences.js";
import { createUiRefs } from "./refs.js";
import {
  clampNonNegativeNumber,
  clampPositiveInt,
  clampRangeNumber,
} from "./shared/validation.js";
import { createInitialUiState } from "./state.js";

export function bootstrapApp() {
  const refs = createUiRefs();

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
      saveProject(state);
      renderAll(refs, state, ui);
    },
    (partialUi) => {
      Object.assign(ui, partialUi);
      renderAll(refs, state, ui);
    },
  );

  renderAll(refs, state, ui);
}
