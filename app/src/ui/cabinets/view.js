import { TECH_LIMITS } from "../../core/constants.js";

export function renderCabinetsView(params) {
  const { cardsContainer, tableBody, cabinets, escapeHtml, formatNumber } =
    params;

  renderCabinetCards(cardsContainer, cabinets, escapeHtml);
  renderCabinetTable(tableBody, cabinets, escapeHtml, formatNumber);
}

function renderCabinetCards(container, cabinets, escapeHtml) {
  if (!container) return;

  container.innerHTML = cabinets
    .map(
      (cab) =>
        '<div class="cabinet-item">' +
        '<div class="cabinet-item-top">' +
        "<strong>" +
        escapeHtml(cab.nome) +
        "</strong>" +
        '<div class="cabinet-item-actions">' +
        '<button class="cabinet-action-btn cabinet-action-btn--edit" data-action="edit-cabinet" data-cabinet-id="' +
        escapeHtml(cab.id) +
        '" aria-label="Editar gabinete" title="Editar">' +
        '<i data-lucide="square-pen" aria-hidden="true"></i>' +
        '<span class="cabinet-action-label">Editar</span>' +
        "</button>" +
        '<button class="cabinet-action-btn cabinet-action-btn--delete" data-action="delete-cabinet" data-cabinet-id="' +
        escapeHtml(cab.id) +
        '" aria-label="Excluir gabinete" title="Excluir">' +
        '<i data-lucide="trash-2" aria-hidden="true"></i>' +
        '<span class="cabinet-action-label">Remover</span>' +
        "</button>" +
        "</div>" +
        "</div>" +
        '<span class="screen-meta">' +
        cab.largura_mm +
        "x" +
        cab.altura_mm +
        " mm | " +
        cab.px_w +
        "x" +
        cab.px_h +
        " px | " +
        cab.watts_max +
        " W</span>" +
        "</div>",
    )
    .join("");
}

function renderCabinetTable(tbody, cabinets, escapeHtml, formatNumber) {
  if (!tbody) return;

  tbody.innerHTML = cabinets
    .map(
      (cab) =>
        "<tr>" +
        "<td>" +
        escapeHtml(cab.nome) +
        "</td>" +
        "<td>" +
        cab.largura_mm +
        " x " +
        cab.altura_mm +
        "</td>" +
        "<td>" +
        cab.px_w +
        " x " +
        cab.px_h +
        "</td>" +
        "<td>" +
        formatNumber(cab.peso_kg, 1) +
        " kg</td>" +
        "<td>" +
        formatNumber(cab.watts_max, 0) +
        " W</td>" +
        "<td>" +
        formatNumber(cab.fp, 2) +
        "</td>" +
        "<td>" +
        Math.floor(TECH_LIMITS.PIXELS_PER_PORT / (cab.px_w * cab.px_h)) +
        "</td>" +
        "</tr>",
    )
    .join("");
}
