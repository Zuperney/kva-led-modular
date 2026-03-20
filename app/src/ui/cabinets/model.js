const CABINET_STORAGE_KEY = "kva-led-cabinets-v1";

export function readCabinetForm(refs) {
  const nome = String(refs.cabNome?.value || "").trim();
  const largura_mm = toPositiveInt(refs.cabLargura?.value);
  const altura_mm = toPositiveInt(refs.cabAltura?.value);
  const px_w = toPositiveInt(refs.cabPxW?.value);
  const px_h = toPositiveInt(refs.cabPxH?.value);
  const peso_kg = toPositiveNumber(refs.cabPeso?.value);
  const watts_max = toPositiveNumber(refs.cabWatts?.value);
  const fp = toPositiveNumber(refs.cabFp?.value || 0.9);

  if (
    !nome ||
    !Number.isFinite(largura_mm) ||
    !Number.isFinite(altura_mm) ||
    !Number.isFinite(px_w) ||
    !Number.isFinite(px_h) ||
    !Number.isFinite(peso_kg) ||
    !Number.isFinite(watts_max) ||
    !Number.isFinite(fp)
  ) {
    return null;
  }

  return {
    id: "cab-" + Date.now(),
    nome,
    largura_mm,
    altura_mm,
    px_w,
    px_h,
    peso_kg,
    watts_max,
    fp,
  };
}

export function clearCabinetForm(refs) {
  [
    refs.cabNome,
    refs.cabLargura,
    refs.cabAltura,
    refs.cabPxW,
    refs.cabPxH,
    refs.cabPeso,
    refs.cabWatts,
    refs.cabFp,
  ].forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.value = "";
    }
  });
}

export function loadCabinetCatalog(state) {
  const fromStorage = tryLoadCatalogStorage();
  const fromScreens = collectCabinetsFromScreens(state.screens);
  const merged = mergeCatalog(fromStorage, fromScreens);

  if (!merged.length) {
    return [defaultCabinetRecord()];
  }

  persistCabinets(merged);
  return merged;
}

export function persistCabinets(cabinets) {
  localStorage.setItem(CABINET_STORAGE_KEY, JSON.stringify(cabinets));
}

export function collectCabinetsFromScreens(screens = []) {
  return screens
    .map((screen, index) => {
      const cab = screen?.gabinete;
      if (!isCabinetLike(cab)) return null;
      return {
        id: "screen-cab-" + index + "-" + (cab.nome || "cab"),
        nome: cab.nome,
        largura_mm: cab.largura_mm,
        altura_mm: cab.altura_mm,
        px_w: cab.px_w,
        px_h: cab.px_h,
        peso_kg: cab.peso_kg,
        watts_max: cab.watts_max,
        fp: cab.fp,
      };
    })
    .filter(Boolean);
}

export function mergeCatalog(base = [], additions = []) {
  const map = new Map();
  [...base, ...additions].forEach((cab, index) => {
    if (!isCabinetLike(cab)) return;
    const key = String(cab.nome || "").toLowerCase();
    map.set(key, {
      ...cab,
      id: cab.id || "cab-" + Date.now() + "-" + index,
    });
  });
  return Array.from(map.values());
}

export function normalizeScreensWithCatalog(state, catalog) {
  const fallback = catalog[0] || defaultCabinetRecord();
  const allowedByName = new Map(catalog.map((cab) => [cab.nome, cab]));

  return {
    ...state,
    screens: state.screens.map((screen) => {
      const selected = allowedByName.get(screen.gabinete?.nome) || fallback;
      return {
        ...screen,
        gabinete: toScreenCabinet(selected),
      };
    }),
  };
}

export function toScreenCabinet(cab) {
  return {
    nome: cab.nome,
    largura_mm: cab.largura_mm,
    altura_mm: cab.altura_mm,
    px_w: cab.px_w,
    px_h: cab.px_h,
    peso_kg: cab.peso_kg,
    watts_max: cab.watts_max,
    fp: cab.fp,
  };
}

export function defaultCabinetRecord() {
  return {
    id: "cab-default-mg10",
    nome: "MG10 P2.6",
    largura_mm: 500,
    altura_mm: 500,
    px_w: 192,
    px_h: 192,
    peso_kg: 6.3,
    watts_max: 450,
    fp: 0.9,
  };
}

function tryLoadCatalogStorage() {
  try {
    const raw = localStorage.getItem(CABINET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => isCabinetLike(item))
      .map((item, index) => ({
        ...item,
        id: item.id || "cab-store-" + index,
      }));
  } catch {
    return [];
  }
}

function isCabinetLike(item) {
  return (
    !!item &&
    Number(item.largura_mm) > 0 &&
    Number(item.altura_mm) > 0 &&
    Number(item.px_w) > 0 &&
    Number(item.px_h) > 0 &&
    Number(item.watts_max) > 0 &&
    Number(item.peso_kg) > 0
  );
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function toPositiveNumber(value) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
}
