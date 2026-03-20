import { normalizeElectricalSystem } from "./controller.js";

const ELECTRICAL_SYSTEM_STORAGE_KEY = "kva-led-electrical-system-v1";

export function loadElectricalSystemPreference(config) {
  if (config?.fase === 3) return "tri";

  try {
    const raw = localStorage.getItem(ELECTRICAL_SYSTEM_STORAGE_KEY);
    return normalizeElectricalSystem(raw, "bi");
  } catch {
    return "bi";
  }
}

export function persistElectricalSystemPreference(system) {
  try {
    localStorage.setItem(
      ELECTRICAL_SYSTEM_STORAGE_KEY,
      normalizeElectricalSystem(system, "bi"),
    );
  } catch {
    // ignore persistence errors
  }
}
