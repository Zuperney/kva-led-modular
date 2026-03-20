export function renderScreensView(params) {
  const { container, screens, activeView, catalog, escapeHtml, formatInteger } =
    params;

  if (!container) return;

  container.innerHTML = screens
    .map(
      (screen) =>
        '<div class="screen-item active">' +
        '<div class="screen-item-head">' +
        '<input class="screen-input" data-action="rename" data-screen-id="' +
        String(screen.id) +
        '" value="' +
        escapeHtml(screen.nome) +
        '">' +
        '<button class="btn-delete" data-action="delete" data-screen-id="' +
        String(screen.id) +
        '">Remover</button>' +
        "</div>" +
        '<div class="screen-grid-edit">' +
        '<input class="screen-input" type="number" min="1" data-action="cols" data-screen-id="' +
        String(screen.id) +
        '" value="' +
        String(screen.quantidade_colunas) +
        '">' +
        '<input class="screen-input" type="number" min="1" data-action="rows" data-screen-id="' +
        String(screen.id) +
        '" value="' +
        String(screen.quantidade_linhas) +
        '">' +
        "</div>" +
        '<select class="screen-select" data-action="cabinet" data-screen-id="' +
        String(screen.id) +
        '">' +
        renderCabinetOptions(catalog, screen.gabinete?.nome, escapeHtml) +
        "</select>" +
        '<span class="screen-meta">' +
        formatInteger(screen.quantidade_colunas * screen.quantidade_linhas) +
        " gabinetes | " +
        (activeView === "project" ? "Modo projeto" : "") +
        "</span>" +
        "</div>",
    )
    .join("");
}

function renderCabinetOptions(catalog, selectedName, escapeHtml) {
  return catalog
    .map((cab) => {
      const selected = cab.nome === selectedName ? " selected" : "";
      return (
        '<option value="' +
        escapeHtml(cab.id) +
        '"' +
        selected +
        ">" +
        escapeHtml(cab.nome) +
        "</option>"
      );
    })
    .join("");
}
