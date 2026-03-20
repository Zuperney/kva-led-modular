import { buildCablingLayouts } from "../../core/cabling.js";

const REPORT_TYPE_META = {
  complete: {
    title: "Relatorio completo",
    description:
      "Primeira pagina consolidada e paginas seguintes dedicadas a cada tela com cabeamento, energia, peso e dados detalhados.",
    lead: "Pacote completo para producao, operacao e montagem em campo.",
  },
  summary: {
    title: "Relatorio resumido",
    description:
      "Somente a pagina consolidada com visao geral do projeto, nomes das telas e totais principais.",
    lead: "Resumo executivo em uma unica pagina.",
  },
  design: {
    title: "Informacoes de design",
    description:
      "Foco em resolucao, aspect ratio, dimensoes fisicas e area de cada tela.",
    lead: "Pacote de referencia para criacao de conteudo e alinhamento visual.",
  },
  structural: {
    title: "Informacoes estruturais",
    description:
      "Laudo de peso, area, dimensoes e distribuicao de gabinetes por tela.",
    lead: "Dados para equipe estrutural e verificacao de carga.",
  },
  electrical: {
    title: "Informacoes eletricas",
    description:
      "Somente informacoes eletricas e dimensoes das telas, com foco em potencia, corrente e protecao.",
    lead: "Base para energia, distribuicao e protecoes do sistema.",
  },
  cabinets: {
    title: "Informacoes de gabinetes",
    description:
      "Lista o nome das telas, gabinete utilizado, quantidade por tela e consolidado total por modelo de gabinete.",
    lead: "Consolidado para estoque, separacao e conferencia de montagem.",
  },
};

export function renderReportView(params) {
  const {
    refs,
    result,
    uiProjection,
    config,
    uiState,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  } = params;

  renderReportTable(
    refs.reportBody,
    result.screens,
    escapeHtml,
    formatNumber,
    formatInteger,
  );
  renderTotals(refs, uiProjection, config, formatNumber, formatInteger);
  renderReportMeta(refs, result, formatNumber, formatInteger, clampRangeNumber);
  renderReportPreview({
    refs,
    result,
    uiProjection,
    config,
    uiState,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  });
}

function renderReportPreview(args) {
  const {
    refs,
    result,
    uiProjection,
    config,
    uiState,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  } = args;
  const container = refs.reportPreview;
  if (!container) return;

  const reportType = uiState?.reportType || "complete";
  const reportMeta = REPORT_TYPE_META[reportType] || REPORT_TYPE_META.complete;
  const cablingConfig = {
    ...config,
    cablingStrategy: uiState?.cablingStrategy,
  };
  const layouts = buildCablingLayouts(result.screens, cablingConfig);
  const pageMarkup = buildReportPages({
    reportType,
    reportMeta,
    result,
    uiProjection,
    config,
    uiState,
    layouts,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  });

  if (refs.reportType instanceof HTMLSelectElement) {
    refs.reportType.value = reportType;
  }
  if (refs.reportTypeDescription) {
    refs.reportTypeDescription.textContent = reportMeta.description;
  }
  if (refs.reportPreviewLead) {
    refs.reportPreviewLead.textContent = reportMeta.lead;
  }
  if (refs.reportPageCount) {
    const totalPages = pageMarkup.length;
    refs.reportPageCount.textContent =
      String(totalPages) + " pagina" + (totalPages === 1 ? "" : "s");
  }

  container.innerHTML = pageMarkup.join("");
  paintReportCanvases(
    container,
    result.screens,
    layouts,
    uiState?.cablingOrientation || "horizontal",
  );
}

function buildReportPages(args) {
  const {
    reportType,
    reportMeta,
    result,
    uiProjection,
    config,
    uiState,
    layouts,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  } = args;
  const context = {
    reportMeta,
    result,
    uiProjection,
    config,
    uiState,
    layouts,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  };

  if (reportType === "summary") {
    return [buildOverviewPage(context, true)];
  }
  if (reportType === "design") {
    return [buildDesignPage(context)];
  }
  if (reportType === "structural") {
    return [buildStructuralPage(context)];
  }
  if (reportType === "electrical") {
    return [buildElectricalPage(context)];
  }
  if (reportType === "cabinets") {
    return [buildCabinetsPage(context)];
  }

  return [
    buildOverviewPage(context, false),
    ...result.screens.map((screen) => buildDetailedScreenPage(screen, context)),
  ];
}

function buildOverviewPage(context, summaryOnly) {
  const {
    reportMeta,
    result,
    uiProjection,
    config,
    escapeHtml,
    formatNumber,
    formatInteger,
    clampRangeNumber,
  } = context;

  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: reportMeta.title,
      title: "Resumo consolidado do projeto",
      subtitle:
        "Visao geral com telas, dimensoes, resolucao, potencia, carga, corrente e totais operacionais.",
      metaLines: [
        "Gerado em: " + new Date().toLocaleString("pt-BR"),
        "Configuracao: " + formatConfigLine(config, clampRangeNumber),
        "Telas: " + formatInteger(result.screens.length),
      ],
    }) +
    buildHighlightGrid([
      ["Area total", formatNumber(uiProjection.area_m2, 2) + " m²"],
      ["Gabinetes", formatInteger(uiProjection.gabinetes)],
      ["Pixels totais", formatInteger(uiProjection.pixels)],
      ["Peso total", formatNumber(uiProjection.peso_kg, 1) + " kg"],
      ["Potencia real", formatNumber(uiProjection.potencia_w, 0) + " W"],
      ["Carga aparente", formatNumber(uiProjection.carga_kva, 2) + " kVA"],
      ["Corrente total", formatNumber(uiProjection.corrente_a, 2) + " A"],
      ["Disjuntor", String(uiProjection.disjuntor_comercial) + " A"],
    ]) +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Tela</th>" +
    "<th>Dimensoes</th>" +
    "<th>Gabinetes</th>" +
    "<th>Resolucao</th>" +
    "<th>Potencia</th>" +
    "<th>Carga</th>" +
    "</tr></thead><tbody>" +
    result.screens
      .map(
        (screen) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(screen.nome) +
          "</strong></td>" +
          "<td>" +
          formatDimensions(screen, formatNumber) +
          "</td>" +
          "<td>" +
          formatInteger(screen.gabinetes_totais) +
          "</td>" +
          "<td>" +
          formatInteger(screen.pixels.largura) +
          " x " +
          formatInteger(screen.pixels.altura) +
          " px</td>" +
          "<td>" +
          formatNumber(screen.potencia_w, 0) +
          " W</td>" +
          "<td>" +
          formatNumber(screen.carga_kva, 2) +
          " kVA</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div>" +
    '<section class="report-section">' +
    "<h4>Nomes das telas</h4>" +
    '<div class="report-screen-chip-list">' +
    result.screens
      .map(
        (screen, index) =>
          '<span class="report-screen-chip">' +
          String(index + 1) +
          ". " +
          escapeHtml(screen.nome) +
          "</span>",
      )
      .join("") +
    "</div></section>" +
    (summaryOnly
      ? '<p class="report-note">Este pacote exporta apenas a folha consolidada.</p>'
      : '<p class="report-note">As proximas paginas detalham cada tela individualmente com mapa de cabeamento, gabinete utilizado, energia, peso, resolucao e blocos de distribuicao.</p>') +
    "</article>"
  );
}

function buildDesignPage(context) {
  const { reportMeta, result, escapeHtml, formatNumber, formatInteger } =
    context;
  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: reportMeta.title,
      title: "Informacoes de design",
      subtitle:
        "Resolucao, aspect ratio e dimensoes fisicas para criacao de conteudo e alinhamento de layout.",
      metaLines: [
        "Gerado em: " + new Date().toLocaleString("pt-BR"),
        "Telas listadas: " + formatInteger(result.screens.length),
      ],
    }) +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Tela</th>" +
    "<th>Resolucao</th>" +
    "<th>Aspect ratio</th>" +
    "<th>Dimensoes</th>" +
    "<th>Area</th>" +
    "<th>Matriz</th>" +
    "</tr></thead><tbody>" +
    result.screens
      .map(
        (screen) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(screen.nome) +
          "</strong></td>" +
          "<td>" +
          formatInteger(screen.pixels.largura) +
          " x " +
          formatInteger(screen.pixels.altura) +
          " px</td>" +
          "<td>" +
          formatAspectRatio(
            screen.pixels.largura,
            screen.pixels.altura,
            formatNumber,
          ) +
          "</td>" +
          "<td>" +
          formatDimensions(screen, formatNumber) +
          "</td>" +
          "<td>" +
          formatNumber(screen.dimensoes_m.area, 2) +
          " m²</td>" +
          "<td>" +
          formatInteger(screen.quantidade_colunas) +
          " x " +
          formatInteger(screen.quantidade_linhas) +
          " gab</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div>" +
    "</article>"
  );
}

function buildStructuralPage(context) {
  const {
    reportMeta,
    result,
    uiProjection,
    escapeHtml,
    formatNumber,
    formatInteger,
  } = context;
  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: reportMeta.title,
      title: "Informacoes estruturais",
      subtitle:
        "Peso, area e dimensoes das telas para validacao de estrutura, rigging e distribuicao de carga.",
      metaLines: [
        "Gerado em: " + new Date().toLocaleString("pt-BR"),
        "Peso total do projeto: " +
          formatNumber(uiProjection.peso_kg, 1) +
          " kg",
      ],
    }) +
    buildHighlightGrid([
      ["Peso total", formatNumber(uiProjection.peso_kg, 1) + " kg"],
      ["Area total", formatNumber(uiProjection.area_m2, 2) + " m²"],
      ["Gabinetes", formatInteger(uiProjection.gabinetes)],
      ["Telas", formatInteger(result.screens.length)],
    ]) +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Tela</th>" +
    "<th>Dimensoes</th>" +
    "<th>Area</th>" +
    "<th>Peso</th>" +
    "<th>Gabinetes</th>" +
    "<th>Gabinete</th>" +
    "</tr></thead><tbody>" +
    result.screens
      .map(
        (screen) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(screen.nome) +
          "</strong></td>" +
          "<td>" +
          formatDimensions(screen, formatNumber) +
          "</td>" +
          "<td>" +
          formatNumber(screen.dimensoes_m.area, 2) +
          " m²</td>" +
          "<td>" +
          formatNumber(screen.peso_kg, 1) +
          " kg</td>" +
          "<td>" +
          formatInteger(screen.gabinetes_totais) +
          "</td>" +
          "<td>" +
          escapeHtml(screen.gabinete?.nome || "-") +
          "</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div>" +
    "</article>"
  );
}

function buildElectricalPage(context) {
  const {
    reportMeta,
    result,
    uiProjection,
    escapeHtml,
    formatNumber,
    formatInteger,
  } = context;
  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: reportMeta.title,
      title: "Informacoes eletricas",
      subtitle:
        "Potencia, carga aparente, corrente, portas e protecao por tela, mantendo dimensoes como referencia de instalacao.",
      metaLines: [
        "Gerado em: " + new Date().toLocaleString("pt-BR"),
        "Potencia total: " + formatNumber(uiProjection.potencia_w, 0) + " W",
        "Corrente total: " + formatNumber(uiProjection.corrente_a, 2) + " A",
      ],
    }) +
    buildHighlightGrid([
      ["Potencia", formatNumber(uiProjection.potencia_w, 0) + " W"],
      ["Carga", formatNumber(uiProjection.carga_kva, 2) + " kVA"],
      ["Corrente", formatNumber(uiProjection.corrente_a, 2) + " A"],
      ["Disjuntor", String(uiProjection.disjuntor_comercial) + " A"],
    ]) +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Tela</th>" +
    "<th>Dimensoes</th>" +
    "<th>Potencia</th>" +
    "<th>Carga</th>" +
    "<th>Corrente</th>" +
    "<th>Disjuntor</th>" +
    "</tr></thead><tbody>" +
    result.screens
      .map(
        (screen) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(screen.nome) +
          "</strong></td>" +
          "<td>" +
          formatDimensions(screen, formatNumber) +
          "</td>" +
          "<td>" +
          formatNumber(screen.potencia_w, 0) +
          " W</td>" +
          "<td>" +
          formatNumber(screen.carga_kva, 2) +
          " kVA</td>" +
          "<td>" +
          formatNumber(screen.corrente_a, 2) +
          " A</td>" +
          "<td>" +
          String(screen.disjuntor_comercial) +
          " A</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div>" +
    "</article>"
  );
}

function buildCabinetsPage(context) {
  const { reportMeta, result, escapeHtml, formatInteger } = context;
  const cabinetTotals = buildCabinetTotals(result.screens);
  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: reportMeta.title,
      title: "Informacoes de gabinetes",
      subtitle:
        "Relacao por tela e consolidado total por modelo de gabinete usado no projeto.",
      metaLines: [
        "Gerado em: " + new Date().toLocaleString("pt-BR"),
        "Modelos distintos: " + formatInteger(cabinetTotals.length),
      ],
    }) +
    '<section class="report-section">' +
    "<h4>Distribuicao por tela</h4>" +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Tela</th>" +
    "<th>Gabinete</th>" +
    "<th>Matriz</th>" +
    "<th>Total de gabinetes</th>" +
    "</tr></thead><tbody>" +
    result.screens
      .map(
        (screen) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(screen.nome) +
          "</strong></td>" +
          "<td>" +
          escapeHtml(screen.gabinete?.nome || "-") +
          "</td>" +
          "<td>" +
          formatInteger(screen.quantidade_colunas) +
          " x " +
          formatInteger(screen.quantidade_linhas) +
          "</td>" +
          "<td>" +
          formatInteger(screen.gabinetes_totais) +
          "</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div></section>" +
    '<section class="report-section">' +
    "<h4>Consolidado por gabinete</h4>" +
    '<div class="table-wrap report-table-wrap">' +
    "<table><thead><tr>" +
    "<th>Gabinete</th>" +
    "<th>Telas</th>" +
    "<th>Total de gabinetes</th>" +
    "</tr></thead><tbody>" +
    cabinetTotals
      .map(
        (item) =>
          "<tr>" +
          "<td><strong>" +
          escapeHtml(item.nome) +
          "</strong></td>" +
          "<td>" +
          escapeHtml(item.telas.join(", ")) +
          "</td>" +
          "<td>" +
          formatInteger(item.totalGabinetes) +
          "</td>" +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div></section>" +
    "</article>"
  );
}

function buildDetailedScreenPage(screen, context) {
  const { layouts, uiState, escapeHtml, formatNumber, formatInteger } = context;
  const layout = layouts.find((item) => String(item.id) === String(screen.id));
  return (
    '<article class="report-page">' +
    buildPageHeader({
      kicker: "Detalhamento por tela",
      title: escapeHtml(screen.nome),
      subtitle:
        "Mapa de cabeamento, informacoes eletricas, peso, gabinete e parametros operacionais desta tela.",
      metaLines: [
        "Gabinete: " + escapeHtml(screen.gabinete?.nome || "-"),
        "Matriz: " +
          formatInteger(screen.quantidade_colunas) +
          " x " +
          formatInteger(screen.quantidade_linhas) +
          " gab",
        "Orientacao do cabo: " +
          (uiState?.cablingOrientation === "vertical"
            ? "Vertical"
            : "Horizontal"),
      ],
    }) +
    '<div class="report-detail-grid">' +
    '<section class="report-detail-panel">' +
    "<h4>Mapa de cabeamento</h4>" +
    '<canvas class="report-detail-canvas" data-report-screen-id="' +
    escapeHtml(String(screen.id)) +
    '" width="1100" height="700"></canvas>' +
    '<p class="report-note">Cada bloco colorido representa um grupo estimado de gabinetes por cabo, numerado na ordem de distribuicao.</p>' +
    "</section>" +
    '<section class="report-detail-stack">' +
    '<div class="report-detail-panel">' +
    "<h4>Resumo tecnico</h4>" +
    buildDetailList([
      ["Dimensoes", formatDimensions(screen, formatNumber)],
      ["Area", formatNumber(screen.dimensoes_m.area, 2) + " m²"],
      [
        "Resolucao",
        formatInteger(screen.pixels.largura) +
          " x " +
          formatInteger(screen.pixels.altura) +
          " px",
      ],
      [
        "Aspect ratio",
        formatAspectRatio(
          screen.pixels.largura,
          screen.pixels.altura,
          formatNumber,
        ),
      ],
      ["Gabinetes", formatInteger(screen.gabinetes_totais)],
      ["Peso", formatNumber(screen.peso_kg, 1) + " kg"],
    ]) +
    "</div>" +
    '<div class="report-detail-panel">' +
    "<h4>Energia e distribuicao</h4>" +
    buildDetailList([
      ["Potencia", formatNumber(screen.potencia_w, 0) + " W"],
      ["Carga aparente", formatNumber(screen.carga_kva, 2) + " kVA"],
      ["Corrente", formatNumber(screen.corrente_a, 2) + " A"],
      ["Disjuntor minimo", formatNumber(screen.disjuntor_minimo_a, 2) + " A"],
      ["Disjuntor sugerido", String(screen.disjuntor_comercial) + " A"],
      ["Portas estimadas", layout ? formatInteger(layout.ports) : "-"],
    ]) +
    "</div>" +
    '<div class="report-detail-panel">' +
    "<h4>Cabinetes e cabeamento</h4>" +
    buildDetailList([
      ["Gabinete", escapeHtml(screen.gabinete?.nome || "-")],
      [
        "Tamanho do gabinete",
        formatCabinetSize(screen.gabinete, formatInteger),
      ],
      [
        "Resolucao por gabinete",
        formatCabinetPixels(screen.gabinete, formatInteger),
      ],
      ["Cabos estimados", layout ? formatInteger(layout.cables) : "-"],
      [
        "Bloco base",
        layout
          ? formatInteger(layout.block.w) +
            " x " +
            formatInteger(layout.block.h) +
            " gab"
          : "-",
      ],
      [
        "Limite por cabo",
        layout ? formatInteger(layout.maxGabsPerCable) + " gab" : "-",
      ],
    ]) +
    "</div>" +
    "</section></div>" +
    "</article>"
  );
}

function buildPageHeader({ kicker, title, subtitle, metaLines }) {
  return (
    '<header class="report-page-header">' +
    '<div><span class="report-kicker">' +
    kicker +
    "</span><h3>" +
    title +
    '</h3><p class="report-subtitle">' +
    subtitle +
    "</p></div>" +
    '<div class="report-page-meta">' +
    metaLines.map((line) => "<span>" + line + "</span>").join("") +
    "</div></header>"
  );
}

function buildHighlightGrid(items) {
  return (
    '<section class="report-highlight-grid">' +
    items
      .map(
        ([label, value]) =>
          '<article class="report-highlight-card"><span>' +
          label +
          "</span><strong>" +
          value +
          "</strong></article>",
      )
      .join("") +
    "</section>"
  );
}

function buildDetailList(items) {
  return (
    '<ul class="report-detail-list">' +
    items
      .map(
        ([label, value]) =>
          "<li><span>" + label + "</span><strong>" + value + "</strong></li>",
      )
      .join("") +
    "</ul>"
  );
}

function buildCabinetTotals(screens) {
  const totals = new Map();
  screens.forEach((screen) => {
    const key = String(screen.gabinete?.nome || "Sem gabinete");
    if (!totals.has(key)) {
      totals.set(key, {
        nome: key,
        telas: [],
        totalGabinetes: 0,
      });
    }
    const entry = totals.get(key);
    entry.totalGabinetes += Number(screen.gabinetes_totais || 0);
    entry.telas.push(screen.nome);
  });

  return Array.from(totals.values()).map((entry) => ({
    ...entry,
    telas: Array.from(new Set(entry.telas)),
  }));
}

function paintReportCanvases(container, screens, layouts, orientation) {
  const layoutById = new Map(layouts.map((item) => [String(item.id), item]));
  const screenById = new Map(screens.map((item) => [String(item.id), item]));
  container
    .querySelectorAll("canvas[data-report-screen-id]")
    .forEach((node) => {
      if (!(node instanceof HTMLCanvasElement)) return;
      const screenId = node.dataset.reportScreenId;
      const screen = screenById.get(String(screenId));
      const layout = layoutById.get(String(screenId));
      if (!screen || !layout) return;
      drawReportCablingCanvas(node, screen, layout, orientation);
    });
}

function drawReportCablingCanvas(canvas, screen, layout, orientation) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f6f4ef";
  ctx.fillRect(0, 0, width, height);

  const gap = 6;
  const padding = 34;
  const cabinetAspect = resolveCabinetAspect(screen);
  const unitW = cabinetAspect;
  const unitH = 1;
  const scale = Math.min(
    (width - padding * 2 - gap * Math.max(1, layout.cols - 1)) /
      (layout.cols * unitW),
    (height - padding * 2 - gap * Math.max(1, layout.rows - 1)) /
      (layout.rows * unitH),
  );
  if (!Number.isFinite(scale) || scale <= 0) return;

  const cabinetWidth = unitW * scale;
  const cabinetHeight = unitH * scale;
  const totalGridWidth =
    layout.cols * cabinetWidth + Math.max(0, layout.cols - 1) * gap;
  const totalGridHeight =
    layout.rows * cabinetHeight + Math.max(0, layout.rows - 1) * gap;
  const offsetX = (width - totalGridWidth) / 2;
  const offsetY = (height - totalGridHeight) / 2;

  ctx.fillStyle = "#e9eeea";
  ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
  ctx.lineWidth = 1.4;

  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.cols; col += 1) {
      const x = offsetX + col * (cabinetWidth + gap);
      const y = offsetY + row * (cabinetHeight + gap);
      ctx.fillRect(x, y, cabinetWidth, cabinetHeight);
      ctx.strokeRect(x, y, cabinetWidth, cabinetHeight);
    }
  }

  layout.blocks.forEach((block, blockIndex) => {
    const color = getCableColor(blockIndex);
    const startX = offsetX + block.x * (cabinetWidth + gap);
    const startY = offsetY + block.y * (cabinetHeight + gap);
    const blockWidth = block.w * cabinetWidth + Math.max(0, block.w - 1) * gap;
    const blockHeight =
      block.h * cabinetHeight + Math.max(0, block.h - 1) * gap;
    const centerX = startX + blockWidth / 2;
    const centerY = startY + blockHeight / 2;

    ctx.fillStyle = addAlpha(color, 0.22);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillRect(startX, startY, blockWidth, blockHeight);
    ctx.strokeRect(startX, startY, blockWidth, blockHeight);

    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(blockIndex + 1), centerX, centerY);

    drawCablePath(
      ctx,
      block,
      offsetX,
      offsetY,
      cabinetWidth,
      cabinetHeight,
      gap,
      orientation,
    );
  });

  ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(offsetX, offsetY, totalGridWidth, totalGridHeight);
}

function drawCablePath(
  ctx,
  block,
  offsetX,
  offsetY,
  cabinetWidth,
  cabinetHeight,
  gap,
  orientation,
) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (orientation === "vertical") {
    for (let col = 0; col < block.w; col += 1) {
      const colX = block.x + col;
      const downward = col % 2 === 0;
      if (downward) {
        for (let row = 0; row < block.h; row += 1) {
          lineToCabinetCenter(
            ctx,
            colX,
            block.y + row,
            col === 0 && row === 0,
            offsetX,
            offsetY,
            cabinetWidth,
            cabinetHeight,
            gap,
          );
        }
      } else {
        for (let row = block.h - 1; row >= 0; row -= 1) {
          lineToCabinetCenter(
            ctx,
            colX,
            block.y + row,
            false,
            offsetX,
            offsetY,
            cabinetWidth,
            cabinetHeight,
            gap,
          );
        }
      }
    }
  } else {
    for (let row = 0; row < block.h; row += 1) {
      const rowY = block.y + row;
      const forward = row % 2 === 0;
      if (forward) {
        for (let col = 0; col < block.w; col += 1) {
          lineToCabinetCenter(
            ctx,
            block.x + col,
            rowY,
            row === 0 && col === 0,
            offsetX,
            offsetY,
            cabinetWidth,
            cabinetHeight,
            gap,
          );
        }
      } else {
        for (let col = block.w - 1; col >= 0; col -= 1) {
          lineToCabinetCenter(
            ctx,
            block.x + col,
            rowY,
            false,
            offsetX,
            offsetY,
            cabinetWidth,
            cabinetHeight,
            gap,
          );
        }
      }
    }
  }

  ctx.stroke();
}

function lineToCabinetCenter(
  ctx,
  colX,
  rowY,
  move,
  offsetX,
  offsetY,
  cabinetWidth,
  cabinetHeight,
  gap,
) {
  const cx = offsetX + colX * (cabinetWidth + gap) + cabinetWidth / 2;
  const cy = offsetY + rowY * (cabinetHeight + gap) + cabinetHeight / 2;
  if (move) {
    ctx.moveTo(cx, cy);
    return;
  }
  ctx.lineTo(cx, cy);
}

function resolveCabinetAspect(screen) {
  const cabinet = screen?.gabinete;
  const pxAspect = toAspect(cabinet?.px_w, cabinet?.px_h);
  const mmAspect = toAspect(cabinet?.largura_mm, cabinet?.altura_mm);
  const screenAspect = toAspect(
    screen?.pixels?.largura,
    screen?.pixels?.altura,
  );

  if (screenAspect && pxAspect && mmAspect) {
    return Math.abs(pxAspect - screenAspect) <=
      Math.abs(mmAspect - screenAspect)
      ? pxAspect
      : mmAspect;
  }
  return pxAspect || mmAspect || 1;
}

function toAspect(width, height) {
  const safeWidth = Number(width);
  const safeHeight = Number(height);
  if (
    !Number.isFinite(safeWidth) ||
    !Number.isFinite(safeHeight) ||
    safeWidth <= 0 ||
    safeHeight <= 0
  ) {
    return null;
  }
  return safeWidth / safeHeight;
}

function addAlpha(hexColor, alpha) {
  const clean = String(hexColor || "").replace("#", "");
  if (clean.length !== 6) return "rgba(15, 118, 110, 0.22)";
  const red = Number.parseInt(clean.slice(0, 2), 16);
  const green = Number.parseInt(clean.slice(2, 4), 16);
  const blue = Number.parseInt(clean.slice(4, 6), 16);
  return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
}

function getCableColor(index) {
  const palette = [
    "#0f766e",
    "#ea580c",
    "#2563eb",
    "#dc2626",
    "#7c3aed",
    "#059669",
    "#ca8a04",
  ];
  return palette[index % palette.length];
}

function formatConfigLine(config, clampRangeNumber) {
  return (
    String(config.tensao) +
    " V | " +
    (config.fase === 3 ? "Trifasica equilibrada" : "Monofasica / Bifasica") +
    " | Brilho " +
    String(clampRangeNumber(config.brilho, 100, 0, 100)) +
    "%"
  );
}

function formatDimensions(screen, formatNumber) {
  return (
    formatNumber(screen.dimensoes_m.largura, 2) +
    " m x " +
    formatNumber(screen.dimensoes_m.altura, 2) +
    " m"
  );
}

function formatCabinetSize(cabinet, formatInteger) {
  if (!cabinet) return "-";
  return (
    formatInteger(cabinet.largura_mm || 0) +
    " x " +
    formatInteger(cabinet.altura_mm || 0) +
    " mm"
  );
}

function formatCabinetPixels(cabinet, formatInteger) {
  if (!cabinet) return "-";
  return (
    formatInteger(cabinet.px_w || 0) +
    " x " +
    formatInteger(cabinet.px_h || 0) +
    " px"
  );
}

function formatAspectRatio(width, height, formatNumber) {
  const safeWidth = Number(width);
  const safeHeight = Number(height);
  if (
    !Number.isFinite(safeWidth) ||
    !Number.isFinite(safeHeight) ||
    safeWidth <= 0 ||
    safeHeight <= 0
  ) {
    return "-";
  }
  const divisor = greatestCommonDivisor(
    Math.round(safeWidth),
    Math.round(safeHeight),
  );
  const ratioWidth = Math.round(safeWidth) / divisor;
  const ratioHeight = Math.round(safeHeight) / divisor;
  return (
    String(ratioWidth) +
    ":" +
    String(ratioHeight) +
    " (" +
    formatNumber(safeWidth / safeHeight, 2) +
    ":1)"
  );
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function renderReportMeta(
  refs,
  result,
  formatNumber,
  formatInteger,
  clampRangeNumber,
) {
  const totals = result.totals;
  const cfg = result.config;

  if (refs.rptGeneratedAt) {
    refs.rptGeneratedAt.textContent = new Date().toLocaleString("pt-BR");
  }
  if (refs.rptConfig) {
    refs.rptConfig.textContent =
      String(cfg.tensao) +
      " V | " +
      (cfg.fase === 3 ? "Trifasica equilibrada" : "Monofasica / Bifasica") +
      " | Brilho " +
      String(clampRangeNumber(cfg.brilho, 100, 0, 100)) +
      "%";
  }
  if (refs.rptProcessor) {
    refs.rptProcessor.textContent = totals.processadora.label;
  }
  if (refs.rptPorts) {
    refs.rptPorts.textContent = formatInteger(totals.portas_estimadas);
  }
  if (refs.rptCurrent) {
    refs.rptCurrent.textContent = formatNumber(totals.corrente_a, 2) + " A";
  }
  if (refs.rptBreakerMin) {
    refs.rptBreakerMin.textContent =
      formatNumber(totals.disjuntor_minimo_a, 2) + " A";
  }
  if (refs.rptBreaker) {
    refs.rptBreaker.textContent = String(totals.disjuntor_comercial);
  }
  if (refs.rptWeight) {
    refs.rptWeight.textContent = formatNumber(totals.peso_kg, 1) + " kg";
  }
}

function renderReportTable(
  tbody,
  screens,
  escapeHtml,
  formatNumber,
  formatInteger,
) {
  if (!tbody) return;
  tbody.innerHTML = screens
    .map(
      (screen) =>
        "<tr>" +
        "<td><strong>" +
        escapeHtml(screen.nome) +
        "</strong></td>" +
        "<td>" +
        formatNumber(screen.dimensoes_m.largura, 2) +
        " m x " +
        formatNumber(screen.dimensoes_m.altura, 2) +
        " m</td>" +
        "<td>" +
        formatInteger(screen.gabinetes_totais) +
        "</td>" +
        "<td>" +
        formatInteger(screen.pixels.largura) +
        " x " +
        formatInteger(screen.pixels.altura) +
        " px" +
        "</td>" +
        "<td>" +
        formatNumber(screen.potencia_w, 2) +
        " W</td>" +
        "<td>" +
        formatNumber(screen.carga_kva, 2) +
        " kVA</td>" +
        "</tr>",
    )
    .join("");
}

function renderTotals(refs, ui, config, formatNumber, formatInteger) {
  if (refs.totArea)
    refs.totArea.textContent =
      "Area total: " + formatNumber(ui.area_m2, 2) + " m²";
  if (refs.totGab) refs.totGab.textContent = formatInteger(ui.gabinetes);
  if (refs.totPx)
    refs.totPx.textContent = "Total px: " + formatInteger(ui.pixels);
  if (refs.totWatts)
    refs.totWatts.textContent = formatNumber(ui.potencia_w, 0) + " W";
  if (refs.totKva)
    refs.totKva.textContent = formatNumber(ui.carga_kva, 2) + " kVA";

  if (refs.dashTensao)
    refs.dashTensao.textContent = String(config?.tensao ?? 220) + " V";
  if (refs.dashGab) refs.dashGab.textContent = formatInteger(ui.gabinetes);
  if (refs.dashPx) refs.dashPx.textContent = formatInteger(ui.pixels);
  if (refs.dashWatts)
    refs.dashWatts.textContent = formatNumber(ui.potencia_w, 0) + " W";
  if (refs.dashKva)
    refs.dashKva.textContent = formatNumber(ui.carga_kva, 2) + " kVA";
  if (refs.dashAmp)
    refs.dashAmp.textContent = formatNumber(ui.corrente_a, 2) + " A";
  if (refs.dashBreaker)
    refs.dashBreaker.textContent = String(ui.disjuntor_comercial);
}
