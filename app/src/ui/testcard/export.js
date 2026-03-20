import { buildTestCardComposition } from "./composition.js";
import { buildTestCardExportCanvas } from "./render.js";

export function exportTestCard(refs, uiState, screens, mode, escapeHtml) {
  const composition = buildTestCardComposition(screens, uiState);

  if (!composition) {
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Cadastre ao menos uma tela para exportar o test card.";
    }
    return;
  }

  const exportConfig = {
    ...(uiState.testCardProjectConfig || {}),
    cablingStrategy:
      uiState.cablingStrategy || uiState.testCardProjectConfig?.cablingStrategy,
  };
  const { canvas, exportScale } = buildTestCardExportCanvas(
    composition,
    uiState,
    exportConfig,
  );
  if (!canvas) {
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Falha ao gerar o test card para exportacao.";
    }
    return;
  }

  const fileSafeName =
    String(composition.title || "test-card")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "test-card";

  if (mode === "png") {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `test-card-${fileSafeName}.png`;
    link.click();
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        exportScale < 1
          ? "Test card exportado em PNG com reducao automatica para caber no limite do navegador."
          : "Test card exportado em PNG.";
    }
    return;
  }

  const dataUrl = canvas.toDataURL("image/png");
  const printWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=800",
  );
  if (!printWindow) {
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Nao foi possivel abrir janela de impressao para PDF.";
    }
    return;
  }

  const title = escapeHtml(composition.title || "Test Card");
  printWindow.document.write(
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
      title +
      '</title><style>body{margin:0;padding:16px;font-family:Segoe UI,sans-serif;background:#fff}img{width:100%;height:auto;border:1px solid #ddd}@page{size:auto;margin:10mm}</style></head><body><img src="' +
      dataUrl +
      '" alt="Test Card"><script>window.onload=function(){window.print();};<\/script></body></html>',
  );
  printWindow.document.close();

  if (refs.migrationStatus) {
    refs.migrationStatus.textContent =
      exportScale < 1
        ? "Test card pronto para impressao/PDF com reducao automatica para caber no limite do navegador."
        : "Test card pronto para impressao/PDF.";
  }
}
