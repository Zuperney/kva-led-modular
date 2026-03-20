import { TECH_LIMITS } from "../../core/constants.js";

export function bindElectricalEvents(params) {
  const {
    refs,
    getState,
    getUi,
    setState,
    setUi,
    persistElectricalSystemPreference,
    clampRangeNumber,
    clampNonNegativeNumber,
    clampPositiveInt,
  } = params;

  refs.cfgSistema?.addEventListener("change", () => {
    const current = getState();
    const ui = getUi();
    const system = normalizeElectricalSystem(
      refs.cfgSistema?.value,
      ui.electricalSystem,
    );
    const nextConfig = readElectricalConfigFromControls(
      refs,
      current.config,
      system,
      clampPositiveInt,
    );

    persistElectricalSystemPreference(system);
    setUi({ electricalSystem: system });
    setState({ ...current, config: nextConfig });
  });

  refs.cfgTensao?.addEventListener("change", () => {
    const current = getState();
    const ui = getUi();
    const system = normalizeElectricalSystem(
      refs.cfgSistema?.value,
      ui.electricalSystem,
    );
    const nextConfig = readElectricalConfigFromControls(
      refs,
      current.config,
      system,
      clampPositiveInt,
    );

    setState({ ...current, config: nextConfig });
  });

  refs.btnOpenElectricalConfig?.addEventListener("click", () => {
    openElectricalConfigModal(
      refs,
      getState().config,
      clampRangeNumber,
      clampNonNegativeNumber,
      clampPositiveInt,
    );
  });

  refs.btnCloseElectricalConfig?.addEventListener("click", () => {
    closeElectricalConfigModal(refs);
  });

  refs.btnSaveElectricalConfig?.addEventListener("click", () => {
    const current = getState();
    const nextConfig = {
      ...current.config,
      brilho: clampRangeNumber(
        refs.cfgBrilho?.value,
        current.config.brilho,
        0,
        100,
      ),
      margem: clampNonNegativeNumber(
        refs.cfgMargem?.value,
        current.config.margem,
      ),
      reservaCircuito: clampNonNegativeNumber(
        refs.cfgReservaCircuito?.value,
        current.config.reservaCircuito,
      ),
      pixelsPerPort: clampPositiveInt(
        refs.cfgPixelsPerPort?.value,
        current.config.pixelsPerPort,
      ),
    };

    setState({ ...current, config: nextConfig });
    closeElectricalConfigModal(refs);
  });

  refs.electricalConfigModal?.addEventListener("click", (event) => {
    if (event.target === refs.electricalConfigModal) {
      closeElectricalConfigModal(refs);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      refs.electricalConfigModal instanceof HTMLElement &&
      !refs.electricalConfigModal.hasAttribute("hidden")
    ) {
      closeElectricalConfigModal(refs);
    }
  });
}

export function syncElectricalControls(
  refs,
  config,
  electricalSystem,
  clampRangeNumber,
  clampNonNegativeNumber,
  clampPositiveInt,
) {
  if (!(refs.cfgSistema instanceof HTMLSelectElement)) return;
  if (!(refs.cfgTensao instanceof HTMLSelectElement)) return;

  const phaseSystem = config?.fase === 3 ? "tri" : "bi";
  const system = normalizeElectricalSystem(electricalSystem, phaseSystem);
  const options = getVoltageOptions(system);

  refs.cfgSistema.value = system;
  refs.cfgTensao.innerHTML = options
    .map(
      (voltage) => '<option value="' + voltage + '">' + voltage + " V</option>",
    )
    .join("");

  const currentVoltage = clampPositiveInt(config?.tensao, options[0]);
  refs.cfgTensao.value = String(
    options.includes(currentVoltage) ? currentVoltage : options[0],
  );

  if (refs.cfgSistemaHint) {
    refs.cfgSistemaHint.textContent = getElectricalHint(system);
  }

  if (refs.cfgBrilho instanceof HTMLInputElement) {
    refs.cfgBrilho.value = String(
      clampRangeNumber(config?.brilho, 100, 0, 100),
    );
  }

  if (refs.cfgMargem instanceof HTMLInputElement) {
    refs.cfgMargem.value = String(clampNonNegativeNumber(config?.margem, 15));
  }

  if (refs.cfgReservaCircuito instanceof HTMLInputElement) {
    refs.cfgReservaCircuito.value = String(
      clampNonNegativeNumber(config?.reservaCircuito, 25),
    );
  }
}

export function normalizeElectricalSystem(value, fallback = "bi") {
  if (value === "mono" || value === "bi" || value === "tri") {
    return value;
  }
  return fallback;
}

function openElectricalConfigModal(
  refs,
  config,
  clampRangeNumber,
  clampNonNegativeNumber,
  clampPositiveInt,
) {
  if (!(refs.electricalConfigModal instanceof HTMLElement)) return;

  if (refs.cfgBrilho instanceof HTMLInputElement) {
    refs.cfgBrilho.value = String(
      clampRangeNumber(config?.brilho, 100, 0, 100),
    );
  }

  if (refs.cfgMargem instanceof HTMLInputElement) {
    refs.cfgMargem.value = String(clampNonNegativeNumber(config?.margem, 15));
  }

  if (refs.cfgReservaCircuito instanceof HTMLInputElement) {
    refs.cfgReservaCircuito.value = String(
      clampNonNegativeNumber(config?.reservaCircuito, 25),
    );
  }

  if (refs.cfgPixelsPerPort instanceof HTMLInputElement) {
    refs.cfgPixelsPerPort.value = String(
      clampPositiveInt(config?.pixelsPerPort, TECH_LIMITS.PIXELS_PER_PORT),
    );
  }

  refs.electricalConfigModal.removeAttribute("hidden");
}

function closeElectricalConfigModal(refs) {
  if (!(refs.electricalConfigModal instanceof HTMLElement)) return;
  refs.electricalConfigModal.setAttribute("hidden", "");
}

function readElectricalConfigFromControls(
  refs,
  baseConfig,
  system,
  clampPositiveInt,
) {
  const options = getVoltageOptions(system);
  const selectedVoltage = clampPositiveInt(refs.cfgTensao?.value, options[0]);
  const tensao = options.includes(selectedVoltage)
    ? selectedVoltage
    : options[0];

  return {
    ...baseConfig,
    tensao,
    fase: system === "tri" ? 3 : 1,
  };
}

function getVoltageOptions(system) {
  if (system === "mono") {
    return [127, 220];
  }
  return [220, 380];
}

function getElectricalHint(system) {
  if (system === "tri") {
    return "Trifasico equilibrado: usa formula trifasica e tende a reduzir corrente por fase.";
  }
  if (system === "mono") {
    return "Monofasico: usa formula monofasica. Confirme a tensao disponivel no gerador/rede.";
  }
  return "Bifasico: usa formula monofasica/bifasica. Ideal para operacao em 220 V entre fases.";
}
