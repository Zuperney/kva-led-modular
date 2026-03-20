import { computeProject, buildUiProjection } from "../core/calculations.js";
import { renderCablingView } from "./cabling/view.js";
import { renderCabinetsView } from "./cabinets/view.js";
import { syncElectricalControls } from "./electrical/controller.js";
import { renderReportView } from "./report/view.js";
import { renderScreensView } from "./screens/view.js";
import { escapeHtml, formatInteger, formatNumber } from "./shared/format.js";
import {
  clampNonNegativeNumber,
  clampPositiveInt,
  clampRangeNumber,
} from "./shared/validation.js";
import { renderTestCardView } from "./testcard/view.js";
import { renderViewState } from "./view-state.js";

export function renderAll(refs, state, uiState) {
  try {
    syncElectricalControls(
      refs,
      state.config,
      uiState.electricalSystem,
      clampRangeNumber,
      clampNonNegativeNumber,
      clampPositiveInt,
    );
    renderViewState(refs, uiState.activeView);

    const result = computeProject({
      config: state.config,
      screens: state.screens,
    });
    const uiProjection = buildUiProjection(result);

    renderScreensView({
      container: refs.screensList,
      screens: state.screens,
      activeView: uiState.activeView,
      catalog: uiState.cabinets,
      escapeHtml,
      formatInteger,
    });
    renderCabinetsView({
      cardsContainer: refs.cabinetsList,
      tableBody: refs.cabinetTableBody,
      cabinets: uiState.cabinets,
      escapeHtml,
      formatNumber,
    });
    renderReportView({
      refs,
      result,
      uiProjection,
      config: state.config,
      uiState,
      escapeHtml,
      formatNumber,
      formatInteger,
      clampRangeNumber,
    });
    const cablingConfig = {
      ...state.config,
      cablingStrategy: uiState.cablingStrategy,
    };
    renderCablingView({
      refs,
      screens: result.screens,
      config: cablingConfig,
      uiState,
      escapeHtml,
      formatInteger,
      formatNumber,
    });
    renderTestCardView({
      refs,
      screens: result.screens,
      config: cablingConfig,
      uiState,
      escapeHtml,
      formatInteger,
    });
  } catch {
    // render errors are non-fatal
  }
}
