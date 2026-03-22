/** Detects whether the current environment needs a mobile-compatible PDF path. */
export function shouldUseMobilePdfFallback() {
  const ua = navigator.userAgent || "";
  const isMobileUa = /Android|iPhone|iPad|iPod/i.test(ua);
  const isStandalone =
    Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches) ||
    window.navigator.standalone === true;
  return isMobileUa || isStandalone;
}

/** Loads an external script tag once; deduplicates by data-ext-lib marker. */
function loadExternalScript(src, marker) {
  const existing = document.querySelector(
    'script[data-ext-lib="' + marker + '"]',
  );
  if (existing) {
    if (existing.dataset.loaded === "1") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(marker)), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.extLib = marker;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "1";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(marker)), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

/** Ensures html2canvas and jsPDF are available, loading them on demand. */
async function ensureMobilePdfLibraries() {
  const hasJsPdf = Boolean(window.jspdf?.jsPDF);
  const hasHtml2Canvas = typeof window.html2canvas === "function";
  if (hasJsPdf && hasHtml2Canvas) return true;

  await loadExternalScript(
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
    "html2canvas",
  );
  await loadExternalScript(
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    "jspdf",
  );

  return (
    Boolean(window.jspdf?.jsPDF) && typeof window.html2canvas === "function"
  );
}

/**
 * Renders every .report-page via html2canvas and produces a native PDF
 * download using jsPDF. Returns true on success, false if unavailable.
 */
export async function exportReportPdfMobileNative(refs) {
  const source = refs.reportPreview;
  if (!source) return false;

  const pages = Array.from(source.querySelectorAll(".report-page"));
  if (!pages.length) return false;

  const libsReady = await ensureMobilePdfLibraries();
  if (!libsReady) return false;

  const { jsPDF } = window.jspdf;
  const html2canvas = window.html2canvas;
  if (typeof jsPDF !== "function" || typeof html2canvas !== "function") {
    return false;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const scale = Math.min(2, Math.max(1.25, window.devicePixelRatio || 1));

  for (let index = 0; index < pages.length; index += 1) {
    const pageNode = pages[index];
    const canvas = await html2canvas(pageNode, {
      backgroundColor: "#ffffff",
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
    });

    const imageData = canvas.toDataURL("image/jpeg", 0.96);
    const ratio = canvas.width / canvas.height || 1;

    let drawWidth = printableWidth;
    let drawHeight = drawWidth / ratio;
    if (drawHeight > printableHeight) {
      drawHeight = printableHeight;
      drawWidth = drawHeight * ratio;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = margin;

    if (index > 0) pdf.addPage("a4", "portrait");
    pdf.addImage(
      imageData,
      "JPEG",
      x,
      y,
      drawWidth,
      drawHeight,
      undefined,
      "FAST",
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = "relatorio-ledlab-" + stamp + ".pdf";
  pdf.save(filename);
  return true;
}

/**
 * Opens a styled print document with the report content.
 * On mobile (mobileCompat: true) uses same-tab Blob navigation to avoid
 * blank popup flows and injects a sticky action bar.
 */
export function openReportPdfFallback(refs, options = {}) {
  const { mobileCompat = false } = options;
  const source = refs.reportPreview;
  if (!source) return false;

  const cssHref = new URL("./src/styles/main.css", window.location.href).href;

  const clone = source.cloneNode(true);

  const sourceCanvasById = new Map();
  source.querySelectorAll("canvas[data-report-screen-id]").forEach((node) => {
    if (!(node instanceof HTMLCanvasElement)) return;
    const id = String(node.dataset.reportScreenId || "");
    if (!id || sourceCanvasById.has(id)) return;
    sourceCanvasById.set(id, node);
  });

  const sourceSnapshotById = new Map();
  source.querySelectorAll("img[data-print-snapshot-for]").forEach((node) => {
    if (!(node instanceof HTMLImageElement)) return;
    const id = String(node.dataset.printSnapshotFor || "");
    if (!id || sourceSnapshotById.has(id)) return;
    sourceSnapshotById.set(id, node);
  });

  clone.querySelectorAll("canvas[data-report-screen-id]").forEach((node) => {
    if (!(node instanceof HTMLCanvasElement)) return;
    const screenId = String(node.dataset.reportScreenId || "");

    const snapshotImage = sourceSnapshotById.get(screenId);
    let dataUrl =
      snapshotImage instanceof HTMLImageElement
        ? String(snapshotImage.src || "")
        : "";

    if (!dataUrl) {
      const sourceCanvas = sourceCanvasById.get(screenId);
      if (sourceCanvas instanceof HTMLCanvasElement) {
        try {
          dataUrl = sourceCanvas.toDataURL("image/png");
        } catch {
          dataUrl = "";
        }
      }
    }

    if (!dataUrl) return;

    const image = document.createElement("img");
    image.src = dataUrl;
    image.className = node.className + " report-detail-canvas-print";
    image.alt = "Mapa de cabeamento da tela";
    image.dataset.reportScreenId = screenId;
    node.replaceWith(image);
  });

  const exportScript = mobileCompat
    ? '(function(){function waitForImages(){var imgs=Array.from(document.images||[]);if(!imgs.length){return Promise.resolve();}return Promise.all(imgs.map(function(img){if(img.complete){return Promise.resolve();}return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});}));}function createBar(){var bar=document.createElement("div");bar.style.position="sticky";bar.style.top="0";bar.style.zIndex="9999";bar.style.display="flex";bar.style.gap="8px";bar.style.padding="10px";bar.style.background="#ffffff";bar.style.borderBottom="1px solid #d6d6d6";bar.style.margin="-16px -16px 12px";var btn=document.createElement("button");btn.type="button";btn.textContent="Imprimir / Salvar PDF";btn.style.padding="10px 14px";btn.style.borderRadius="10px";btn.style.border="1px solid #0f766e";btn.style.background="#0f766e";btn.style.color="#fff";btn.style.fontWeight="600";btn.addEventListener("click",function(){window.print();});var back=document.createElement("button");back.type="button";back.textContent="Voltar";back.style.padding="10px 14px";back.style.borderRadius="10px";back.style.border="1px solid #94a3b8";back.style.background="#ffffff";back.style.color="#0f172a";back.style.fontWeight="600";back.addEventListener("click",function(){window.history.back();});var note=document.createElement("span");note.textContent="Modo compatibilidade mobile ativo";note.style.alignSelf="center";note.style.fontSize="13px";note.style.color="#334155";bar.appendChild(btn);bar.appendChild(back);bar.appendChild(note);document.body.insertBefore(bar,document.body.firstChild);}window.onload=function(){waitForImages().then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){createBar();});});});};})();'
    : '(function(){function waitForImages(){var imgs=Array.from(document.images||[]);if(!imgs.length){return Promise.resolve();}return Promise.all(imgs.map(function(img){if(img.complete){return Promise.resolve();}return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});}));}window.onload=function(){waitForImages().then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){window.print();});});});};})();';

  const html =
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Relatorio LedLab CORE</title><link rel="stylesheet" href="' +
    cssHref +
    '"><style>:root{color-scheme:light only} html,body{margin:0;padding:16px;background:#fff !important;color:#0f172a !important} .report-sheet{border:none;padding:0} .report-page{box-shadow:none} .report-preview-head{display:none} @media print {*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>' +
    clone.innerHTML +
    "<script>" +
    exportScript +
    "<\/script></body></html>";

  if (mobileCompat) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.location.assign(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  }

  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=900",
  );
  if (win) {
    win.document.write(html);
    win.document.close();
    return true;
  }

  return false;
}
