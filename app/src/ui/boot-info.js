import { APP_META } from "../core/constants.js";

export function updateBootInfo(bootInfo) {
  if (!bootInfo) return;

  const timestamp = new Date().toLocaleString("pt-BR");
  bootInfo.textContent =
    "Bootstrap modular ativo | " +
    APP_META.name +
    " v" +
    APP_META.version +
    " | " +
    timestamp;
}
