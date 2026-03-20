import {
  CANVAS_LIMITS,
  IMPORT_LIMITS,
  TESTCARD_EXPORT_LIMITS,
} from "./constants.js";

export function isSafariIOS() {
  const ua = navigator.userAgent || "";
  const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIOSDesktopMode = /Macintosh/i.test(ua) && "ontouchend" in document;
  const isSafariEngine = /Safari/i.test(ua);
  const isOtherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return (
    (isIOSDevice || isIOSDesktopMode) && isSafariEngine && !isOtherIOSBrowser
  );
}

export function resolveImportLimits() {
  if (!isSafariIOS()) return IMPORT_LIMITS;

  return {
    PROJECT_FILE_MAX_BYTES: Math.min(
      IMPORT_LIMITS.PROJECT_FILE_MAX_BYTES,
      IMPORT_LIMITS.IOS_PROJECT_FILE_MAX_BYTES,
    ),
    CATALOG_FILE_MAX_BYTES: Math.min(
      IMPORT_LIMITS.CATALOG_FILE_MAX_BYTES,
      IMPORT_LIMITS.IOS_CATALOG_FILE_MAX_BYTES,
    ),
  };
}

export function resolveCanvasLimits() {
  if (!isSafariIOS()) {
    return {
      renderMaxPixels: CANVAS_LIMITS.RENDER_MAX_PIXELS,
      minRenderScale: CANVAS_LIMITS.MIN_RENDER_SCALE,
    };
  }

  return {
    renderMaxPixels: Math.min(
      CANVAS_LIMITS.RENDER_MAX_PIXELS,
      CANVAS_LIMITS.IOS_RENDER_MAX_PIXELS,
    ),
    minRenderScale: Math.max(
      CANVAS_LIMITS.MIN_RENDER_SCALE,
      CANVAS_LIMITS.IOS_MIN_RENDER_SCALE,
    ),
  };
}

export function resolveTestCardExportLimits() {
  if (!isSafariIOS()) {
    return {
      maxDimension: TESTCARD_EXPORT_LIMITS.MAX_DIMENSION,
      maxArea: TESTCARD_EXPORT_LIMITS.MAX_AREA,
    };
  }

  return {
    maxDimension: Math.min(
      TESTCARD_EXPORT_LIMITS.MAX_DIMENSION,
      TESTCARD_EXPORT_LIMITS.IOS_MAX_DIMENSION,
    ),
    maxArea: Math.min(
      TESTCARD_EXPORT_LIMITS.MAX_AREA,
      TESTCARD_EXPORT_LIMITS.IOS_MAX_AREA,
    ),
  };
}
