import { DEFAULTS } from "./constants.js";

/**
 * Utilitarios canonicos de parsing numerico compartilhados por core e adapters.
 * Normaliza separadores decimais (virgula → ponto) e whitespace antes de parsear.
 */

function normalizeNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(",", ".");
}

/**
 * Converte para inteiro positivo. Retorna `fallback` (default NaN) se invalido.
 * @param {*} value
 * @param {number} [fallback=NaN]
 * @returns {number}
 */
export function toPositiveInt(value, fallback = NaN) {
  const parsed = Number.parseInt(normalizeNumber(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Converte para numero positivo (float). Retorna `fallback` (default NaN) se invalido.
 * @param {*} value
 * @param {number} [fallback=NaN]
 * @returns {number}
 */
export function toPositiveNumber(value, fallback = NaN) {
  const parsed = Number.parseFloat(normalizeNumber(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Resolve fator de potencia. Retorna DEFAULTS.POWER_FACTOR se invalido.
 * @param {*} value
 * @returns {number}
 */
export function resolvePowerFactor(value) {
  const parsed = Number.parseFloat(normalizeNumber(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS.POWER_FACTOR;
}
