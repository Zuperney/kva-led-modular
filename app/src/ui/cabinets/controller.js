import { resolveImportLimits } from "../../core/platform.js";

export function bindCabinetEvents(params) {
  const {
    refs,
    getState,
    getUi,
    setState,
    setUi,
    parseCatalogInput,
    readFileText,
    mergeCatalog,
    persistCabinets,
    normalizeScreensWithCatalog,
    readCabinetForm,
    clearCabinetForm,
  } = params;

  let editingCabinetId = null;

  function setCabinetFormFromRecord(cabinet) {
    if (!cabinet) return;
    if (refs.cabNome) refs.cabNome.value = String(cabinet.nome || "");
    if (refs.cabLargura)
      refs.cabLargura.value = String(cabinet.largura_mm || "");
    if (refs.cabAltura) refs.cabAltura.value = String(cabinet.altura_mm || "");
    if (refs.cabPxW) refs.cabPxW.value = String(cabinet.px_w || "");
    if (refs.cabPxH) refs.cabPxH.value = String(cabinet.px_h || "");
    if (refs.cabPeso) refs.cabPeso.value = String(cabinet.peso_kg || "");
    if (refs.cabWatts) refs.cabWatts.value = String(cabinet.watts_max || "");
    if (refs.cabFp) refs.cabFp.value = String(cabinet.fp || "");
  }

  function resetCabinetEditMode() {
    editingCabinetId = null;
    if (refs.btnAddCabinet) {
      refs.btnAddCabinet.textContent = "Cadastrar";
    }
  }

  function enableCabinetEditMode(cabinet) {
    editingCabinetId = cabinet?.id || null;
    setCabinetFormFromRecord(cabinet);
    if (refs.btnAddCabinet) {
      refs.btnAddCabinet.textContent = "Salvar";
    }
  }

  refs.btnImportCabinets?.addEventListener("click", () => {
    refs.importCabinetInput?.click();
  });

  refs.importCabinetInput?.addEventListener("change", async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return;

    try {
      const importLimits = resolveImportLimits();
      const text = await readFileText(input.files[0], {
        maxBytes: importLimits.CATALOG_FILE_MAX_BYTES,
        fileLabel: "arquivo de catalogo",
      });
      const parsed = parseCatalogInput(text);
      const importedCatalog = parsed.cabinets.map((cabinet, index) => ({
        ...cabinet,
        id: "imp-" + Date.now() + "-" + index,
      }));

      const ui = getUi();
      const merged = mergeCatalog(ui.cabinets, importedCatalog);
      const persisted = persistCabinets(merged);
      setUi({ cabinets: merged });
      setState(normalizeScreensWithCatalog(getState(), merged));

      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Catalogo importado: " +
          parsed.parsedCount +
          " itens validos" +
          (parsed.skipped.length
            ? " | " + parsed.skipped.length + " linhas ignoradas"
            : "") +
          (persisted ? "" : " | Aviso: sem persistencia local nesta sessao.");
      }
    } catch (error) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Falha no import de gabinetes: " +
          (error?.message || "erro desconhecido");
      }
    } finally {
      input.value = "";
    }
  });

  refs.btnAddCabinet?.addEventListener("click", () => {
    const cabinet = readCabinetForm(refs);
    if (!cabinet) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Preencha os campos do gabinete com valores validos.";
      }
      return;
    }

    const ui = getUi();
    const wasEditing = Boolean(editingCabinetId);

    const merged = editingCabinetId
      ? ui.cabinets.map((existing) =>
          existing.id === editingCabinetId
            ? { ...cabinet, id: editingCabinetId }
            : existing,
        )
      : mergeCatalog(ui.cabinets, [cabinet]);

    const persisted = persistCabinets(merged);
    clearCabinetForm(refs);
    resetCabinetEditMode();
    setUi({ cabinets: merged });
    setState(normalizeScreensWithCatalog(getState(), merged));

    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        (wasEditing
          ? "Gabinete atualizado no catalogo local."
          : "Gabinete cadastrado no catalogo local.") +
        (persisted ? "" : " Aviso: sem persistencia local nesta sessao.");
    }
  });

  refs.cabinetsList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const actionButton = target.closest("button[data-action]");
    if (!(actionButton instanceof HTMLButtonElement)) return;

    const action = actionButton.dataset.action;
    const cabinetId = actionButton.dataset.cabinetId;

    if (!cabinetId) return;

    if (action === "edit-cabinet") {
      const ui = getUi();
      const current = ui.cabinets.find((cab) => cab.id === cabinetId);
      if (!current) return;
      enableCabinetEditMode(current);
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Modo edicao ativo: ajuste os campos e clique em Salvar.";
      }
      return;
    }

    if (action !== "delete-cabinet") return;

    const ui = getUi();
    const nextCatalog = ui.cabinets.filter((cab) => cab.id !== cabinetId);

    if (!nextCatalog.length) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "O catalogo precisa ter ao menos um gabinete.";
      }
      return;
    }

    if (editingCabinetId === cabinetId) {
      clearCabinetForm(refs);
      resetCabinetEditMode();
    }

    const persisted = persistCabinets(nextCatalog);
    setUi({ cabinets: nextCatalog });
    setState(normalizeScreensWithCatalog(getState(), nextCatalog));

    if (!persisted && refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Gabinete removido. Aviso: sem persistencia local nesta sessao.";
    }
  });
}
