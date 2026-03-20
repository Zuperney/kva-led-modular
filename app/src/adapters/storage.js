import { STORAGE_KEYS } from "../core/constants.js";
import {
  isProjectV1,
  normalizeProjectV1,
  migrateLegacyProjectData,
} from "../core/project-schema.js";

const STORAGE_PROBE_KEY = "__kva_led_storage_probe__";

export function canUseLocalStorage() {
  try {
    localStorage.setItem(STORAGE_PROBE_KEY, "1");
    localStorage.removeItem(STORAGE_PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadProject() {
  try {
    const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE);
    if (activeRaw) {
      const parsed = JSON.parse(activeRaw);

      if (isProjectV1(parsed)) {
        return normalizeProjectV1(parsed);
      }

      if (isLegacyShape(parsed)) {
        const migrated = migrateLegacyProjectData(parsed);
        saveProject(migrated);
        return migrated;
      }
    }

    const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY);
    if (!legacyRaw) {
      return null;
    }

    const legacyParsed = JSON.parse(legacyRaw);
    if (!isLegacyShape(legacyParsed)) {
      return null;
    }

    const migrated = migrateLegacyProjectData(legacyParsed);
    saveProject(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function saveProject(data) {
  try {
    const normalized = normalizeProjectV1(data);
    normalized.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

function isLegacyShape(value) {
  return !!value && typeof value === "object" && Array.isArray(value.telas);
}

export { migrateLegacyProjectData };
