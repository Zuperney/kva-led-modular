export function renderScreensView(params) {
  const {
    container,
    screens,
    activeView,
    screenEditorId,
    catalog,
    escapeHtml,
    formatInteger,
  } = params;

  if (!container) return;

  container.innerHTML = screens
    .map((screen) => {
      const isEditing = String(screen.id) === String(screenEditorId || "");
      const totalCabinets = formatInteger(
        screen.quantidade_colunas * screen.quantidade_linhas,
      );
      const cabinetName = escapeHtml(screen.gabinete?.nome || "Sem gabinete");

      return (
        '<div class="screen-item' +
        (isEditing ? " active" : "") +
        '">' +
        '<div class="screen-item-head">' +
        '<div class="screen-item-summary">' +
        '<strong class="screen-name">' +
        escapeHtml(screen.nome) +
        "</strong>" +
        '<span class="screen-meta">' +
        totalCabinets +
        " gabinetes | " +
        cabinetName +
        "</span>" +
        "</div>" +
        '<div class="screen-item-actions">' +
        '<button class="cabinet-action-btn cabinet-action-btn--edit btn-screen-action" data-action="toggle-edit" data-screen-id="' +
        String(screen.id) +
        '" aria-label="' +
        (isEditing ? "Concluir edicao da tela" : "Editar tela") +
        '" title="' +
        (isEditing ? "Concluir" : "Editar") +
        '">' +
        '<i data-lucide="' +
        (isEditing ? "check" : "square-pen") +
        '" aria-hidden="true"></i>' +
        '<span class="cabinet-action-label">' +
        (isEditing ? "Concluir" : "Editar") +
        "</span>" +
        "</button>" +
        '<button class="cabinet-action-btn cabinet-action-btn--delete btn-screen-action" data-action="delete" data-screen-id="' +
        String(screen.id) +
        '" aria-label="Remover tela" title="Remover">' +
        '<i data-lucide="trash-2" aria-hidden="true"></i>' +
        '<span class="cabinet-action-label">Remover</span>' +
        "</button>" +
        "</div>" +
        "</div>" +
        (isEditing
          ? '<div class="screen-item-editor">' +
            '<input class="screen-input" data-action="rename" data-screen-id="' +
            String(screen.id) +
            '" value="' +
            escapeHtml(screen.nome) +
            '">' +
            '<div class="screen-config-row">' +
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
            '<select class="screen-select screen-cabinet-select" data-action="cabinet" data-screen-id="' +
            String(screen.id) +
            '">' +
            renderCabinetOptions(catalog, screen.gabinete?.nome, escapeHtml) +
            "</select>" +
            "</div>" +
            (activeView === "project"
              ? '<span class="screen-meta">Modo projeto</span>'
              : "") +
            "</div>"
          : "") +
        "</div>"
      );
    })
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
